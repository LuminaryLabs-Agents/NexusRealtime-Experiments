#include <android/log.h>
#include <android_native_app_glue.h>
#include <EGL/egl.h>
#include <GLES3/gl3.h>
#include <openxr/openxr.h>
#include <openxr/openxr_platform.h>
#include <algorithm>
#include <cmath>
#include <cstring>
#include <string>
#include <vector>

#define LOG_TAG "SpatialAuthoringOpenXR"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

struct Color { float r; float g; float b; float a; };
struct UiRect { float cx; float cy; float sx; float sy; Color color; };
struct NativeDskObject { std::string id; std::string type; float x; float y; float scaleX; float scaleY; Color color; };

static float clampf(float value, float lo, float hi) { return std::max(lo, std::min(value, hi)); }
static XrPosef identityPose(){ XrPosef p{}; p.orientation.w = 1.0f; return p; }
static bool ok(XrResult r, const char* label){ if(XR_FAILED(r)){ LOGE("%s failed %d", label, r); return false; } return true; }

class NativeDskBridge {
public:
  NativeDskBridge() { LOGI("Guided native DSK bridge initialized."); }

  void tick() {
    frame++;
    unsigned long long scriptFrame = frame % loopFrames;
    phase = static_cast<int>(scriptFrame / phaseFrames);
    phaseProgress = static_cast<float>(scriptFrame % phaseFrames) / static_cast<float>(phaseFrames);
    rebuildObjects();
  }

  void updateCursorFromPose(const XrQuaternionf& q) {
    const float sinYaw = 2.0f * (q.w * q.y + q.x * q.z);
    const float cosYaw = 1.0f - 2.0f * (q.y * q.y + q.z * q.z);
    const float yaw = std::atan2(sinYaw, cosYaw);
    float sinPitch = 2.0f * (q.w * q.x - q.z * q.y);
    sinPitch = clampf(sinPitch, -1.0f, 1.0f);
    const float pitch = std::asin(sinPitch);
    // Inverse 3DOF: the floating workbench reacts opposite head rotation, like dragging the scene under gaze.
    cursorX = clampf(0.50f - yaw * 0.70f, 0.10f, 0.90f);
    cursorY = clampf(0.50f + pitch * 0.85f, 0.16f, 0.84f);
  }

  const std::vector<NativeDskObject>& getObjects() const { return objects; }
  int selectedIndex() const { return selected; }
  unsigned long long currentFrame() const { return frame; }
  int currentPhase() const { return phase; }
  float currentPhaseProgress() const { return phaseProgress; }
  float getCursorX() const { return cursorX; }
  float getCursorY() const { return cursorY; }

private:
  static constexpr unsigned long long phaseFrames = 240;
  static constexpr unsigned long long loopFrames = phaseFrames * 6;

  void add(const char* id, const char* type, float x, float y, float sx, float sy, Color c) {
    objects.push_back({id, type, x, y, sx, sy, c});
  }

  void rebuildObjects() {
    objects.clear();
    selected = phase == 0 ? 0 : phase == 1 ? 1 : phase == 2 ? 1 : phase == 3 ? 3 : phase == 4 ? 2 : 4;

    const float pulse = 0.5f + 0.5f * std::sin(static_cast<float>(frame) * 0.075f);
    const float noteShift = phase == 2 ? (phaseProgress - 0.5f) * 0.22f : 0.0f;
    const float timerScale = phase == 4 ? (1.0f + phaseProgress * 0.65f) : 1.0f;
    const float newGrow = phase >= 3 ? (phase == 3 ? phaseProgress : 1.0f) : 0.0f;

    add("panel-dashboard", "widget.panel", 0.25f, 0.55f, 0.20f, 0.13f, {0.14f, 0.42f + 0.18f * pulse, 1.00f, 1.0f});
    add("note-alpha", "widget.note", 0.50f + noteShift, 0.53f, 0.16f, 0.105f, {0.95f, 0.67f, 0.20f, 1.0f});
    add("timer-focus", "widget.timer", 0.74f, 0.54f, 0.14f * timerScale, 0.09f * timerScale, {0.14f, 0.85f, 0.74f, 1.0f});

    if (newGrow > 0.02f) {
      add("created-widget", "widget.note.created", 0.50f, 0.32f, 0.18f * newGrow, 0.10f * newGrow, {0.96f, 0.92f, 0.35f, 1.0f});
    }

    add("save-state", "persistence.snapshot", 0.50f, 0.18f, phase == 5 ? 0.18f + 0.22f * phaseProgress : 0.14f, 0.035f, phase == 5 ? Color{0.20f, 1.00f, 0.38f, 1.0f} : Color{0.18f, 0.30f, 0.42f, 1.0f});
  }

  std::vector<NativeDskObject> objects;
  int selected = 0;
  int phase = 0;
  float phaseProgress = 0.0f;
  float cursorX = 0.5f;
  float cursorY = 0.5f;
  unsigned long long frame = 0;
};

class SpatialAuthoringApp {
public:
  explicit SpatialAuthoringApp(android_app* app): app(app) {}
  void run(){
    app->userData=this;
    app->onAppCmd=[](android_app* a,int32_t c){ if(c==APP_CMD_DESTROY) static_cast<SpatialAuthoringApp*>(a->userData)->exit=true; };
    if(!init()) LOGE("OpenXR init failed");
    while(!exit && !app->destroyRequested){
      int events=0; android_poll_source* source=nullptr;
      while(ALooper_pollOnce(running?0:100,nullptr,&events,reinterpret_cast<void**>(&source))>=0){
        if(source) source->process(app,source);
        if(app->destroyRequested) exit=true;
      }
      poll();
      if(running) frame();
    }
    shutdown();
  }
private:
  struct Swapchain { XrSwapchain handle{XR_NULL_HANDLE}; int32_t width{0}; int32_t height{0}; std::vector<XrSwapchainImageOpenGLESKHR> images; };

  bool init(){ return initLoader() && createInstance() && getSystem() && initEgl() && createSession() && createSpace() && createSwapchains(); }
  bool initLoader(){
    PFN_xrInitializeLoaderKHR fn=nullptr;
    xrGetInstanceProcAddr(XR_NULL_HANDLE,"xrInitializeLoaderKHR",reinterpret_cast<PFN_xrVoidFunction*>(&fn));
    if(!fn) return true;
    XrLoaderInitInfoAndroidKHR info{XR_TYPE_LOADER_INIT_INFO_ANDROID_KHR};
    info.applicationVM=app->activity->vm;
    info.applicationContext=app->activity->clazz;
    return ok(fn(reinterpret_cast<XrLoaderInitInfoBaseHeaderKHR*>(&info)),"xrInitializeLoaderKHR");
  }
  bool ext(const char* name,const std::vector<XrExtensionProperties>& xs){ for(const auto& x:xs) if(std::strcmp(x.extensionName,name)==0) return true; return false; }
  bool createInstance(){
    uint32_t count=0;
    xrEnumerateInstanceExtensionProperties(nullptr,0,&count,nullptr);
    std::vector<XrExtensionProperties> xs(count,{XR_TYPE_EXTENSION_PROPERTIES});
    xrEnumerateInstanceExtensionProperties(nullptr,count,&count,xs.data());
    std::vector<const char*> enabled={XR_KHR_ANDROID_CREATE_INSTANCE_EXTENSION_NAME,XR_KHR_OPENGL_ES_ENABLE_EXTENSION_NAME};
    if(ext(XR_EXT_HAND_TRACKING_EXTENSION_NAME,xs)){ enabled.push_back(XR_EXT_HAND_TRACKING_EXTENSION_NAME); handTracking=true; }
    XrInstanceCreateInfoAndroidKHR androidInfo{XR_TYPE_INSTANCE_CREATE_INFO_ANDROID_KHR};
    androidInfo.applicationVM=app->activity->vm;
    androidInfo.applicationActivity=app->activity->clazz;
    XrInstanceCreateInfo ci{XR_TYPE_INSTANCE_CREATE_INFO};
    ci.next=&androidInfo;
    ci.enabledExtensionCount=(uint32_t)enabled.size();
    ci.enabledExtensionNames=enabled.data();
    std::strncpy(ci.applicationInfo.applicationName,"Spatial Authoring OpenXR",XR_MAX_APPLICATION_NAME_SIZE-1);
    std::strncpy(ci.applicationInfo.engineName,"NexusRealtime",XR_MAX_ENGINE_NAME_SIZE-1);
    ci.applicationInfo.apiVersion=XR_CURRENT_API_VERSION;
    return ok(xrCreateInstance(&ci,&instance),"xrCreateInstance");
  }
  bool getSystem(){ XrSystemGetInfo info{XR_TYPE_SYSTEM_GET_INFO}; info.formFactor=XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY; return ok(xrGetSystem(instance,&info,&systemId),"xrGetSystem"); }
  bool initEgl(){
    display=eglGetDisplay(EGL_DEFAULT_DISPLAY);
    if(display==EGL_NO_DISPLAY||!eglInitialize(display,nullptr,nullptr)) return false;
    const EGLint attrs[]={EGL_RENDERABLE_TYPE,EGL_OPENGL_ES3_BIT,EGL_SURFACE_TYPE,EGL_PBUFFER_BIT,EGL_RED_SIZE,8,EGL_GREEN_SIZE,8,EGL_BLUE_SIZE,8,EGL_ALPHA_SIZE,8,EGL_NONE};
    EGLint n=0;
    if(!eglChooseConfig(display,attrs,&config,1,&n)||n<1) return false;
    const EGLint cattrs[]={EGL_CONTEXT_CLIENT_VERSION,3,EGL_NONE};
    context=eglCreateContext(display,config,EGL_NO_CONTEXT,cattrs);
    if(context==EGL_NO_CONTEXT) return false;
    const EGLint pb[]={EGL_WIDTH,16,EGL_HEIGHT,16,EGL_NONE};
    surface=eglCreatePbufferSurface(display,config,pb);
    return surface!=EGL_NO_SURFACE && eglMakeCurrent(display,surface,surface,context);
  }
  bool createSession(){
    PFN_xrGetOpenGLESGraphicsRequirementsKHR req=nullptr;
    xrGetInstanceProcAddr(instance,"xrGetOpenGLESGraphicsRequirementsKHR",reinterpret_cast<PFN_xrVoidFunction*>(&req));
    if(!req) return false;
    XrGraphicsRequirementsOpenGLESKHR gr{XR_TYPE_GRAPHICS_REQUIREMENTS_OPENGL_ES_KHR};
    if(!ok(req(instance,systemId,&gr),"xrGetOpenGLESGraphicsRequirementsKHR")) return false;
    XrGraphicsBindingOpenGLESAndroidKHR bind{XR_TYPE_GRAPHICS_BINDING_OPENGL_ES_ANDROID_KHR};
    bind.display=display;
    bind.config=config;
    bind.context=context;
    XrSessionCreateInfo si{XR_TYPE_SESSION_CREATE_INFO};
    si.next=&bind;
    si.systemId=systemId;
    return ok(xrCreateSession(instance,&si,&session),"xrCreateSession");
  }
  bool createSpace(){ XrReferenceSpaceCreateInfo info{XR_TYPE_REFERENCE_SPACE_CREATE_INFO}; info.referenceSpaceType=XR_REFERENCE_SPACE_TYPE_LOCAL; info.poseInReferenceSpace=identityPose(); return ok(xrCreateReferenceSpace(session,&info,&space),"xrCreateReferenceSpace"); }
  int64_t chooseFormat(){ uint32_t count=0; xrEnumerateSwapchainFormats(session,0,&count,nullptr); std::vector<int64_t> fs(count); xrEnumerateSwapchainFormats(session,count,&count,fs.data()); return fs.empty()?GL_RGBA8:fs[0]; }
  bool createSwapchains(){
    uint32_t vc=0;
    xrEnumerateViewConfigurationViews(instance,systemId,XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO,0,&vc,nullptr);
    configViews.resize(vc,{XR_TYPE_VIEW_CONFIGURATION_VIEW});
    xrEnumerateViewConfigurationViews(instance,systemId,XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO,vc,&vc,configViews.data());
    views.resize(vc,{XR_TYPE_VIEW});
    swapchains.resize(vc);
    projectionViews.resize(vc,{XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW});
    for(uint32_t i=0;i<vc;i++){
      XrSwapchainCreateInfo info{XR_TYPE_SWAPCHAIN_CREATE_INFO};
      info.usageFlags=XR_SWAPCHAIN_USAGE_COLOR_ATTACHMENT_BIT;
      info.format=chooseFormat();
      info.sampleCount=configViews[i].recommendedSwapchainSampleCount;
      info.width=configViews[i].recommendedImageRectWidth;
      info.height=configViews[i].recommendedImageRectHeight;
      info.faceCount=1;
      info.arraySize=1;
      info.mipCount=1;
      if(!ok(xrCreateSwapchain(session,&info,&swapchains[i].handle),"xrCreateSwapchain")) return false;
      swapchains[i].width=(int32_t)info.width;
      swapchains[i].height=(int32_t)info.height;
      uint32_t ic=0;
      xrEnumerateSwapchainImages(swapchains[i].handle,0,&ic,nullptr);
      swapchains[i].images.resize(ic,{XR_TYPE_SWAPCHAIN_IMAGE_OPENGL_ES_KHR});
      xrEnumerateSwapchainImages(swapchains[i].handle,ic,&ic,reinterpret_cast<XrSwapchainImageBaseHeader*>(swapchains[i].images.data()));
    }
    return true;
  }
  void poll(){
    XrEventDataBuffer e{XR_TYPE_EVENT_DATA_BUFFER};
    while(instance!=XR_NULL_HANDLE && xrPollEvent(instance,&e)==XR_SUCCESS){
      if(e.type==XR_TYPE_EVENT_DATA_SESSION_STATE_CHANGED){
        auto* s=reinterpret_cast<XrEventDataSessionStateChanged*>(&e);
        if(s->state==XR_SESSION_STATE_READY){
          XrSessionBeginInfo bi{XR_TYPE_SESSION_BEGIN_INFO};
          bi.primaryViewConfigurationType=XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO;
          if(ok(xrBeginSession(session,&bi),"xrBeginSession")) running=true;
        } else if(s->state==XR_SESSION_STATE_STOPPING){
          xrEndSession(session);
          running=false;
        } else if(s->state==XR_SESSION_STATE_EXITING||s->state==XR_SESSION_STATE_LOSS_PENDING) exit=true;
      }
      e={XR_TYPE_EVENT_DATA_BUFFER};
    }
  }
  void frame(){
    bridge.tick();
    XrFrameState fs{XR_TYPE_FRAME_STATE};
    XrFrameWaitInfo wi{XR_TYPE_FRAME_WAIT_INFO};
    if(!ok(xrWaitFrame(session,&wi,&fs),"xrWaitFrame")) return;
    XrFrameBeginInfo bi{XR_TYPE_FRAME_BEGIN_INFO};
    xrBeginFrame(session,&bi);
    std::vector<XrCompositionLayerBaseHeader*> layers;
    XrCompositionLayerProjection layer{XR_TYPE_COMPOSITION_LAYER_PROJECTION};
    if(fs.shouldRender){
      XrViewLocateInfo li{XR_TYPE_VIEW_LOCATE_INFO};
      li.viewConfigurationType=XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO;
      li.displayTime=fs.predictedDisplayTime;
      li.space=space;
      XrViewState vs{XR_TYPE_VIEW_STATE};
      uint32_t vc=0;
      xrLocateViews(session,&li,&vs,(uint32_t)views.size(),&vc,views.data());
      if(vc > 0) bridge.updateCursorFromPose(views[0].pose.orientation);
      for(uint32_t i=0;i<vc;i++) renderView(i,views[i]);
      layer.space=space;
      layer.viewCount=vc;
      layer.views=projectionViews.data();
      layers.push_back((XrCompositionLayerBaseHeader*)&layer);
    }
    XrFrameEndInfo ei{XR_TYPE_FRAME_END_INFO};
    ei.displayTime=fs.predictedDisplayTime;
    ei.environmentBlendMode=XR_ENVIRONMENT_BLEND_MODE_OPAQUE;
    ei.layerCount=(uint32_t)layers.size();
    ei.layers=layers.empty()?nullptr:layers.data();
    xrEndFrame(session,&ei);
  }

  void rect(const Swapchain& sc, float cx, float cy, float sx, float sy, Color color) {
    int w = std::max(1, static_cast<int>(sc.width * sx));
    int h = std::max(1, static_cast<int>(sc.height * sy));
    int x = static_cast<int>(sc.width * cx) - w / 2;
    int y = static_cast<int>(sc.height * cy) - h / 2;
    int x0 = std::max(0, x);
    int y0 = std::max(0, y);
    int x1 = std::min(sc.width, x + w);
    int y1 = std::min(sc.height, y + h);
    if(x1 <= x0 || y1 <= y0) return;
    glScissor(x0, y0, x1 - x0, y1 - y0);
    glClearColor(color.r, color.g, color.b, color.a);
    glClear(GL_COLOR_BUFFER_BIT);
  }

  void drawObject(const Swapchain& sc, const NativeDskObject& object, bool selected) {
    if(selected) rect(sc, object.x, object.y, object.scaleX + 0.018f, object.scaleY + 0.022f, {1.0f, 0.96f, 0.55f, 1.0f});
    rect(sc, object.x, object.y, object.scaleX, object.scaleY, object.color);
  }

  void overlay(const Swapchain& sc){
    glEnable(GL_SCISSOR_TEST);

    // Six phase pips: scene graph, select, transform, create widget, resize, save.
    for(int i = 0; i < 6; ++i) {
      Color pip = i <= bridge.currentPhase() ? Color{0.60f, 0.95f, 1.0f, 1.0f} : Color{0.10f, 0.18f, 0.26f, 1.0f};
      rect(sc, 0.285f + 0.086f * i, 0.88f, 0.052f, 0.020f, pip);
    }

    // Guided progress rail.
    rect(sc, 0.50f, 0.105f, 0.72f, 0.016f, {0.08f, 0.12f, 0.17f, 1.0f});
    const float totalProgress = (static_cast<float>(bridge.currentPhase()) + bridge.currentPhaseProgress()) / 6.0f;
    rect(sc, 0.14f + 0.72f * totalProgress * 0.5f, 0.105f, 0.72f * totalProgress, 0.016f, {0.25f, 0.82f, 1.0f, 1.0f});

    const auto& objects = bridge.getObjects();
    for(size_t i=0;i<objects.size();i++) drawObject(sc, objects[i], (int)i==bridge.selectedIndex());

    // Inverse 3DOF gaze cursor.
    const float cx = bridge.getCursorX();
    const float cy = bridge.getCursorY();
    rect(sc, cx, cy, 0.038f, 0.006f, {1.0f, 1.0f, 1.0f, 1.0f});
    rect(sc, cx, cy, 0.006f, 0.038f, {1.0f, 1.0f, 1.0f, 1.0f});
    rect(sc, cx, cy, 0.016f, 0.016f, {0.14f, 0.48f, 1.0f, 1.0f});

    glDisable(GL_SCISSOR_TEST);
  }
  void renderView(uint32_t i,const XrView& view){
    auto& sc=swapchains[i];
    uint32_t image=0;
    XrSwapchainImageAcquireInfo ai{XR_TYPE_SWAPCHAIN_IMAGE_ACQUIRE_INFO};
    xrAcquireSwapchainImage(sc.handle,&ai,&image);
    XrSwapchainImageWaitInfo wait{XR_TYPE_SWAPCHAIN_IMAGE_WAIT_INFO};
    wait.timeout=XR_INFINITE_DURATION;
    xrWaitSwapchainImage(sc.handle,&wait);
    GLuint fbo=0;
    glGenFramebuffers(1,&fbo);
    glBindFramebuffer(GL_FRAMEBUFFER,fbo);
    glFramebufferTexture2D(GL_FRAMEBUFFER,GL_COLOR_ATTACHMENT0,GL_TEXTURE_2D,sc.images[image].image,0);
    glViewport(0,0,sc.width,sc.height);
    glDisable(GL_SCISSOR_TEST);
    glClearColor(0.025f, handTracking?0.11f:0.07f, 0.16f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);
    overlay(sc);
    glBindFramebuffer(GL_FRAMEBUFFER,0);
    glDeleteFramebuffers(1,&fbo);
    projectionViews[i]={XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW};
    projectionViews[i].pose=view.pose;
    projectionViews[i].fov=view.fov;
    projectionViews[i].subImage.swapchain=sc.handle;
    projectionViews[i].subImage.imageRect.offset={0,0};
    projectionViews[i].subImage.imageRect.extent={sc.width,sc.height};
    XrSwapchainImageReleaseInfo ri{XR_TYPE_SWAPCHAIN_IMAGE_RELEASE_INFO};
    xrReleaseSwapchainImage(sc.handle,&ri);
  }
  void shutdown(){
    for(auto& sc:swapchains) if(sc.handle!=XR_NULL_HANDLE) xrDestroySwapchain(sc.handle);
    if(space!=XR_NULL_HANDLE) xrDestroySpace(space);
    if(session!=XR_NULL_HANDLE) xrDestroySession(session);
    if(instance!=XR_NULL_HANDLE) xrDestroyInstance(instance);
    if(display!=EGL_NO_DISPLAY){
      eglMakeCurrent(display,EGL_NO_SURFACE,EGL_NO_SURFACE,EGL_NO_CONTEXT);
      if(surface!=EGL_NO_SURFACE) eglDestroySurface(display,surface);
      if(context!=EGL_NO_CONTEXT) eglDestroyContext(display,context);
      eglTerminate(display);
    }
  }
  android_app* app=nullptr;
  NativeDskBridge bridge;
  bool exit=false;
  bool running=false;
  bool handTracking=false;
  XrInstance instance{XR_NULL_HANDLE};
  XrSystemId systemId{XR_NULL_SYSTEM_ID};
  XrSession session{XR_NULL_HANDLE};
  XrSpace space{XR_NULL_HANDLE};
  EGLDisplay display{EGL_NO_DISPLAY};
  EGLConfig config{};
  EGLContext context{EGL_NO_CONTEXT};
  EGLSurface surface{EGL_NO_SURFACE};
  std::vector<XrViewConfigurationView> configViews;
  std::vector<XrView> views;
  std::vector<Swapchain> swapchains;
  std::vector<XrCompositionLayerProjectionView> projectionViews;
};

void android_main(android_app* app){ app_dummy(); SpatialAuthoringApp runtime(app); runtime.run(); }
