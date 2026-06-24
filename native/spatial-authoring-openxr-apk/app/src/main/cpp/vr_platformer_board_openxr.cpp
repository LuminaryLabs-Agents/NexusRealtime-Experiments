#include <android/input.h>
#include <android/log.h>
#include <android_native_app_glue.h>
#include <EGL/egl.h>
#include <GLES3/gl3.h>
#include <openxr/openxr.h>
#include <openxr/openxr_platform.h>
#include <algorithm>
#include <cmath>
#include <cstring>
#include <vector>

#define LOG_TAG "VRPlatformerBoardOpenXR"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

struct Color { float r, g, b, a; };
struct Mat4 { float m[16]; };
struct Rect { float x, y, w, h; Color color; };
struct Particle { float x, y, vx, vy, ttl, size; Color color; };

static float clampf(float v, float lo, float hi) { return std::max(lo, std::min(v, hi)); }
static bool ok(XrResult result, const char* label) { if (XR_FAILED(result)) { LOGE("%s failed: %d", label, result); return false; } return true; }
static XrPosef identityPose() { XrPosef p{}; p.orientation.w = 1.0f; return p; }
static Mat4 identity() { Mat4 r{}; r.m[0] = r.m[5] = r.m[10] = r.m[15] = 1.0f; return r; }
static Mat4 translate(float x, float y, float z) { Mat4 r = identity(); r.m[12] = x; r.m[13] = y; r.m[14] = z; return r; }
static Mat4 scale(float x, float y, float z) { Mat4 r = identity(); r.m[0] = x; r.m[5] = y; r.m[10] = z; return r; }
static Mat4 mul(const Mat4& a, const Mat4& b) { Mat4 r{}; for (int c=0;c<4;++c) for (int row=0;row<4;++row) for (int k=0;k<4;++k) r.m[c*4+row] += a.m[k*4+row] * b.m[c*4+k]; return r; }
static Mat4 projection(const XrFovf& fov) { const float l=std::tan(fov.angleLeft), r=std::tan(fov.angleRight), d=std::tan(fov.angleDown), u=std::tan(fov.angleUp); const float w=r-l, h=u-d, n=0.05f, f=80.0f; Mat4 m{}; m.m[0]=2.0f/w; m.m[5]=2.0f/h; m.m[8]=(r+l)/w; m.m[9]=(u+d)/h; m.m[10]=-(f+n)/(f-n); m.m[11]=-1.0f; m.m[14]=-(2.0f*f*n)/(f-n); return m; }
static Mat4 viewFromPose(const XrPosef& pose) { const XrQuaternionf q=pose.orientation; const float x=-q.x,y=-q.y,z=-q.z,w=q.w; Mat4 r=identity(); r.m[0]=1-2*y*y-2*z*z; r.m[1]=2*x*y+2*w*z; r.m[2]=2*x*z-2*w*y; r.m[4]=2*x*y-2*w*z; r.m[5]=1-2*x*x-2*z*z; r.m[6]=2*y*z+2*w*x; r.m[8]=2*x*z+2*w*y; r.m[9]=2*y*z-2*w*x; r.m[10]=1-2*x*x-2*y*y; return mul(r, translate(-pose.position.x, -pose.position.y, -pose.position.z)); }

class EndlessPlatformer {
public:
  float playerY = 1.0f;
  float velY = 0.0f;
  bool grounded = true;
  float scroll = 0.0f;
  float speed = 3.6f;
  unsigned long long frame = 0;
  float pointerX = 0.0f;
  float pointerY = 1.55f;
  std::vector<Particle> particles;

  void reset() {
    playerY = 1.0f; velY = 0.0f; grounded = true; scroll = 0.0f; speed = 3.6f; frame = 0; particles.clear();
    LOGI("Endless VR platformer: eye-level board, trigger jump, click burst");
  }

  void jump() {
    if (!grounded) return;
    velY = 12.8f;
    grounded = false;
    burst(0.0f, playerY + 0.75f, {1.0f, 1.0f, 1.0f, 1.0f});
    LOGI("platformer-avatar-domain-kit: trigger jump");
  }

  void clickBurst() {
    burst(pointerX, pointerY, {0.35f, 0.85f, 1.0f, 1.0f});
    LOGI("platformer-effects-domain-kit: click burst x=%.2f y=%.2f", pointerX, pointerY);
  }

  void setPointerFromBoard(float x, float y) {
    pointerX = clampf(x, -0.78f, 0.78f);
    pointerY = clampf(y, 1.12f, 1.94f);
  }

  void tick(float dt) {
    frame++;
    scroll += speed * dt;
    speed = std::min(6.6f, speed + 0.012f * dt);
    velY = std::max(-28.0f, velY - 31.0f * dt);
    float previousY = playerY;
    playerY += velY * dt;
    grounded = false;

    for (int i = -2; i < 16; ++i) {
      Rect p = platformAt(i);
      const bool overX = std::fabs(p.x) < p.w * 0.55f + 0.08f;
      const bool landing = overX && previousY >= p.y + p.h && playerY <= p.y + p.h && velY <= 0.0f;
      if (landing) { playerY = p.y + p.h; velY = 0.0f; grounded = true; }
    }
    if (playerY < -0.8f) { burst(0.0f, 1.25f, {1.0f, 0.18f, 0.32f, 1.0f}); playerY = 1.0f; velY = 0.0f; grounded = true; }

    for (int i = static_cast<int>(particles.size()) - 1; i >= 0; --i) {
      Particle& p = particles[(size_t)i];
      p.ttl -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 0.45f * dt;
      p.color.a = std::max(0.0f, p.ttl * 1.8f);
      if (p.ttl <= 0.0f) particles.erase(particles.begin() + i);
    }
  }

  Rect platformAt(int index) const {
    const float spacing = 2.25f;
    const float worldX = index * spacing - std::fmod(scroll, spacing);
    const int lane = (index + static_cast<int>(scroll / spacing)) % 5;
    const float y = 0.42f + 0.18f * std::sin((index + scroll * 0.12f) * 1.7f) + (lane == 2 ? 0.16f : 0.0f);
    const float width = lane == 0 ? 0.72f : lane == 3 ? 0.48f : 0.58f;
    return {worldX, y, width, 0.055f, {0.38f, 0.56f, 1.0f, 1.0f}};
  }

private:
  void burst(float x, float y, Color color) {
    for (int i = 0; i < 18; ++i) {
      const float a = (float)i / 18.0f * 6.2831853f;
      const float s = 0.20f + 0.22f * ((i % 5) / 4.0f);
      particles.push_back({x, y, std::cos(a) * s, std::sin(a) * s, 0.52f, 0.024f, color});
    }
  }
};

class Host {
public:
  explicit Host(android_app* a) : app(a) {}
  void run() {
    app->userData = this;
    app->onAppCmd = [](android_app* a, int32_t cmd){ if (cmd == APP_CMD_DESTROY) static_cast<Host*>(a->userData)->exit = true; };
    app->onInputEvent = [](android_app* a, AInputEvent* e)->int32_t { return static_cast<Host*>(a->userData)->onInput(e); };
    game.reset();
    if (!init()) LOGE("OpenXR init failed for endless VR platformer board");
    while (!exit && !app->destroyRequested) {
      int events=0; android_poll_source* src=nullptr;
      while (ALooper_pollOnce(running?0:100, nullptr, &events, reinterpret_cast<void**>(&src)) >= 0) { if (src) src->process(app, src); if (app->destroyRequested) exit = true; }
      pollEvents();
      if (running) frame();
    }
    shutdown();
  }
private:
  struct Swapchain { XrSwapchain handle{XR_NULL_HANDLE}; int32_t width{0}, height{0}; std::vector<XrSwapchainImageOpenGLESKHR> images; };

  int32_t onInput(AInputEvent* event) {
    if (AInputEvent_getType(event) == AINPUT_EVENT_TYPE_KEY) {
      const int action=AKeyEvent_getAction(event), key=AKeyEvent_getKeyCode(event);
      if (action==AKEY_EVENT_ACTION_DOWN) {
        if (key==AKEYCODE_BUTTON_A || key==AKEYCODE_SPACE || key==AKEYCODE_DPAD_UP) game.jump();
        else game.clickBurst();
        return 1;
      }
    }
    if (AInputEvent_getType(event) == AINPUT_EVENT_TYPE_MOTION) {
      const int action = AMotionEvent_getAction(event) & AMOTION_EVENT_ACTION_MASK;
      const float rt = std::max(AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_RTRIGGER,0), AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_GAS,0));
      if (rt > 0.2f && !triggerDown) { triggerDown=true; game.jump(); return 1; }
      if (rt <= 0.2f) triggerDown=false;
      if (action == AMOTION_EVENT_ACTION_DOWN || action == AMOTION_EVENT_ACTION_POINTER_DOWN) { game.clickBurst(); return 1; }
      return 1;
    }
    return 0;
  }

  bool init(){ return initLoader() && createInstance() && createActions() && getSystem() && initEgl() && createProgram() && createSession() && attachActions() && createSpaces() && createSwapchains(); }
  bool initLoader(){ PFN_xrInitializeLoaderKHR fn=nullptr; xrGetInstanceProcAddr(XR_NULL_HANDLE,"xrInitializeLoaderKHR",reinterpret_cast<PFN_xrVoidFunction*>(&fn)); if(!fn) return true; XrLoaderInitInfoAndroidKHR info{XR_TYPE_LOADER_INIT_INFO_ANDROID_KHR}; info.applicationVM=app->activity->vm; info.applicationContext=app->activity->clazz; return ok(fn(reinterpret_cast<XrLoaderInitInfoBaseHeaderKHR*>(&info)),"xrInitializeLoaderKHR"); }
  bool createInstance(){ const char* exts[]={XR_KHR_ANDROID_CREATE_INSTANCE_EXTENSION_NAME,XR_KHR_OPENGL_ES_ENABLE_EXTENSION_NAME}; XrInstanceCreateInfoAndroidKHR ai{XR_TYPE_INSTANCE_CREATE_INFO_ANDROID_KHR}; ai.applicationVM=app->activity->vm; ai.applicationActivity=app->activity->clazz; XrInstanceCreateInfo ci{XR_TYPE_INSTANCE_CREATE_INFO}; ci.next=&ai; ci.enabledExtensionCount=2; ci.enabledExtensionNames=exts; std::strncpy(ci.applicationInfo.applicationName,"Endless VR Platformer",XR_MAX_APPLICATION_NAME_SIZE-1); std::strncpy(ci.applicationInfo.engineName,"NexusRealtime",XR_MAX_ENGINE_NAME_SIZE-1); ci.applicationInfo.apiVersion=XR_CURRENT_API_VERSION; return ok(xrCreateInstance(&ci,&instance),"xrCreateInstance"); }
  bool createActions(){ XrActionSetCreateInfo si{XR_TYPE_ACTION_SET_CREATE_INFO}; std::strncpy(si.actionSetName,"endless_platformer",XR_MAX_ACTION_SET_NAME_SIZE-1); std::strncpy(si.localizedActionSetName,"Endless Platformer",XR_MAX_LOCALIZED_ACTION_SET_NAME_SIZE-1); if(!ok(xrCreateActionSet(instance,&si,&actionSet),"xrCreateActionSet")) return false; xrStringToPath(instance,"/user/hand/right",&rightHandPath); XrActionCreateInfo a{XR_TYPE_ACTION_CREATE_INFO}; a.countSubactionPaths=1; a.subactionPaths=&rightHandPath; a.actionType=XR_ACTION_TYPE_BOOLEAN_INPUT; std::strncpy(a.actionName,"jump",XR_MAX_ACTION_NAME_SIZE-1); std::strncpy(a.localizedActionName,"Jump",XR_MAX_LOCALIZED_ACTION_NAME_SIZE-1); xrCreateAction(actionSet,&a,&jumpAction); a.actionType=XR_ACTION_TYPE_POSE_INPUT; std::strncpy(a.actionName,"right_aim",XR_MAX_ACTION_NAME_SIZE-1); std::strncpy(a.localizedActionName,"Right Aim",XR_MAX_LOCALIZED_ACTION_NAME_SIZE-1); xrCreateAction(actionSet,&a,&aimAction); suggestBinding("/interaction_profiles/khr/simple_controller", "/user/hand/right/input/select/click", "/user/hand/right/input/aim/pose"); suggestBinding("/interaction_profiles/bytedance/pico4_controller", "/user/hand/right/input/trigger/click", "/user/hand/right/input/aim/pose"); suggestBinding("/interaction_profiles/bytedance/pico_neo3_controller", "/user/hand/right/input/trigger/click", "/user/hand/right/input/aim/pose"); return true; }
  void suggestBinding(const char* profileName, const char* jumpPath, const char* aimPath) { XrPath profile{XR_NULL_PATH}, jump{XR_NULL_PATH}, aim{XR_NULL_PATH}; if (XR_FAILED(xrStringToPath(instance, profileName, &profile))) return; xrStringToPath(instance, jumpPath, &jump); xrStringToPath(instance, aimPath, &aim); XrActionSuggestedBinding bindings[2] = {{jumpAction, jump}, {aimAction, aim}}; XrInteractionProfileSuggestedBinding s{XR_TYPE_INTERACTION_PROFILE_SUGGESTED_BINDING}; s.interactionProfile = profile; s.countSuggestedBindings = 2; s.suggestedBindings = bindings; LOGI("suggestBinding profile=%s result=%d", profileName, xrSuggestInteractionProfileBindings(instance, &s)); }
  bool getSystem(){ XrSystemGetInfo info{XR_TYPE_SYSTEM_GET_INFO}; info.formFactor=XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY; return ok(xrGetSystem(instance,&info,&systemId),"xrGetSystem"); }
  bool initEgl(){ display=eglGetDisplay(EGL_DEFAULT_DISPLAY); if(display==EGL_NO_DISPLAY||!eglInitialize(display,nullptr,nullptr)) return false; const EGLint attrs[]={EGL_RENDERABLE_TYPE,EGL_OPENGL_ES3_BIT,EGL_SURFACE_TYPE,EGL_PBUFFER_BIT,EGL_RED_SIZE,8,EGL_GREEN_SIZE,8,EGL_BLUE_SIZE,8,EGL_ALPHA_SIZE,8,EGL_DEPTH_SIZE,16,EGL_NONE}; EGLint n=0; if(!eglChooseConfig(display,attrs,&eglConfig,1,&n)||n<1) return false; const EGLint ca[]={EGL_CONTEXT_CLIENT_VERSION,3,EGL_NONE}; context=eglCreateContext(display,eglConfig,EGL_NO_CONTEXT,ca); const EGLint sa[]={EGL_WIDTH,16,EGL_HEIGHT,16,EGL_NONE}; surface=eglCreatePbufferSurface(display,eglConfig,sa); return context!=EGL_NO_CONTEXT&&surface!=EGL_NO_SURFACE&&eglMakeCurrent(display,surface,surface,context); }
  GLuint shader(GLenum type,const char* src){ GLuint s=glCreateShader(type); glShaderSource(s,1,&src,nullptr); glCompileShader(s); return s; }
  bool createProgram(){ const char* vs="#version 300 es\nlayout(location=0)in vec3 p;uniform mat4 mvp;void main(){gl_Position=mvp*vec4(p,1.0);}"; const char* fs="#version 300 es\nprecision mediump float;uniform vec4 col;out vec4 o;void main(){o=col;}"; GLuint v=shader(GL_VERTEX_SHADER,vs), f=shader(GL_FRAGMENT_SHADER,fs); program=glCreateProgram(); glAttachShader(program,v); glAttachShader(program,f); glLinkProgram(program); glDeleteShader(v); glDeleteShader(f); float quad[]={-0.5f,-0.5f,0, .5f,-0.5f,0, .5f,.5f,0, -0.5f,-0.5f,0, .5f,.5f,0, -0.5f,.5f,0}; glGenBuffers(1,&vbo); glBindBuffer(GL_ARRAY_BUFFER,vbo); glBufferData(GL_ARRAY_BUFFER,sizeof(quad),quad,GL_STATIC_DRAW); return true; }
  bool createSession(){ PFN_xrGetOpenGLESGraphicsRequirementsKHR req=nullptr; xrGetInstanceProcAddr(instance,"xrGetOpenGLESGraphicsRequirementsKHR",reinterpret_cast<PFN_xrVoidFunction*>(&req)); if(!req) return false; XrGraphicsRequirementsOpenGLESKHR gr{XR_TYPE_GRAPHICS_REQUIREMENTS_OPENGL_ES_KHR}; req(instance,systemId,&gr); XrGraphicsBindingOpenGLESAndroidKHR b{XR_TYPE_GRAPHICS_BINDING_OPENGL_ES_ANDROID_KHR}; b.display=display; b.config=eglConfig; b.context=context; XrSessionCreateInfo ci{XR_TYPE_SESSION_CREATE_INFO}; ci.next=&b; ci.systemId=systemId; return ok(xrCreateSession(instance,&ci,&session),"xrCreateSession"); }
  bool attachActions(){ XrSessionActionSetsAttachInfo ai{XR_TYPE_SESSION_ACTION_SETS_ATTACH_INFO}; ai.countActionSets=1; ai.actionSets=&actionSet; return ok(xrAttachSessionActionSets(session,&ai),"xrAttachSessionActionSets"); }
  bool createSpaces(){ XrReferenceSpaceCreateInfo ri{XR_TYPE_REFERENCE_SPACE_CREATE_INFO}; ri.referenceSpaceType=XR_REFERENCE_SPACE_TYPE_LOCAL; ri.poseInReferenceSpace=identityPose(); if(!ok(xrCreateReferenceSpace(session,&ri,&space),"xrCreateReferenceSpace")) return false; XrActionSpaceCreateInfo ai{XR_TYPE_ACTION_SPACE_CREATE_INFO}; ai.action=aimAction; ai.subactionPath=rightHandPath; ai.poseInActionSpace=identityPose(); xrCreateActionSpace(session,&ai,&aimSpace); return true; }
  int64_t chooseFormat(){ uint32_t c=0; xrEnumerateSwapchainFormats(session,0,&c,nullptr); std::vector<int64_t> fs(c); if(c) xrEnumerateSwapchainFormats(session,c,&c,fs.data()); return fs.empty()?GL_RGBA8:fs[0]; }
  bool createSwapchains(){ uint32_t c=0; xrEnumerateViewConfigurationViews(instance,systemId,XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO,0,&c,nullptr); configViews.resize(c,{XR_TYPE_VIEW_CONFIGURATION_VIEW}); xrEnumerateViewConfigurationViews(instance,systemId,XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO,c,&c,configViews.data()); views.resize(c,{XR_TYPE_VIEW}); swapchains.resize(c); projectionViews.resize(c,{XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW}); int64_t fmt=chooseFormat(); for(uint32_t i=0;i<c;++i){ XrSwapchainCreateInfo si{XR_TYPE_SWAPCHAIN_CREATE_INFO}; si.usageFlags=XR_SWAPCHAIN_USAGE_COLOR_ATTACHMENT_BIT; si.format=fmt; si.sampleCount=configViews[i].recommendedSwapchainSampleCount; si.width=configViews[i].recommendedImageRectWidth; si.height=configViews[i].recommendedImageRectHeight; si.faceCount=1; si.arraySize=1; si.mipCount=1; if(!ok(xrCreateSwapchain(session,&si,&swapchains[i].handle),"xrCreateSwapchain")) return false; swapchains[i].width=si.width; swapchains[i].height=si.height; uint32_t ic=0; xrEnumerateSwapchainImages(swapchains[i].handle,0,&ic,nullptr); swapchains[i].images.resize(ic,{XR_TYPE_SWAPCHAIN_IMAGE_OPENGL_ES_KHR}); xrEnumerateSwapchainImages(swapchains[i].handle,ic,&ic,reinterpret_cast<XrSwapchainImageBaseHeader*>(swapchains[i].images.data())); } return true; }
  void pollEvents(){ XrEventDataBuffer e{XR_TYPE_EVENT_DATA_BUFFER}; while(instance && xrPollEvent(instance,&e)==XR_SUCCESS){ if(e.type==XR_TYPE_EVENT_DATA_SESSION_STATE_CHANGED){ auto* s=reinterpret_cast<XrEventDataSessionStateChanged*>(&e); if(s->state==XR_SESSION_STATE_READY){ XrSessionBeginInfo bi{XR_TYPE_SESSION_BEGIN_INFO}; bi.primaryViewConfigurationType=XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO; if(ok(xrBeginSession(session,&bi),"xrBeginSession")) running=true; } else if(s->state==XR_SESSION_STATE_STOPPING){ xrEndSession(session); running=false; } else if(s->state==XR_SESSION_STATE_EXITING||s->state==XR_SESSION_STATE_LOSS_PENDING) exit=true; } e={XR_TYPE_EVENT_DATA_BUFFER}; } }
  void syncActions(XrTime time, const XrPosef& headPose){ XrActiveActionSet active{actionSet,XR_NULL_PATH}; XrActionsSyncInfo sync{XR_TYPE_ACTIONS_SYNC_INFO}; sync.countActiveActionSets=1; sync.activeActionSets=&active; xrSyncActions(session,&sync); XrActionStateGetInfo get{XR_TYPE_ACTION_STATE_GET_INFO}; get.subactionPath=rightHandPath; get.action=jumpAction; XrActionStateBoolean b{XR_TYPE_ACTION_STATE_BOOLEAN}; if(XR_SUCCEEDED(xrGetActionStateBoolean(session,&get,&b))&&b.isActive){ if(b.currentState&&!triggerDown){ triggerDown=true; game.jump(); } if(!b.currentState) triggerDown=false; } XrSpaceLocation loc{XR_TYPE_SPACE_LOCATION}; if (aimSpace && XR_SUCCEEDED(xrLocateSpace(aimSpace, space, time, &loc)) && (loc.locationFlags & XR_SPACE_LOCATION_POSITION_VALID_BIT) && (loc.locationFlags & XR_SPACE_LOCATION_ORIENTATION_VALID_BIT)) updatePointer(loc.pose); else updatePointer(headPose); }
  void updatePointer(const XrPosef& pose) { const XrQuaternionf q = pose.orientation; const float x = 2.0f * (q.x*q.z + q.w*q.y); const float y = 2.0f * (q.y*q.z - q.w*q.x); game.setPointerFromBoard(clampf(x * 0.8f, -0.78f, 0.78f), clampf(1.55f + y * 0.5f, 1.12f, 1.94f)); }
  void frame(){ game.tick(1.0f/60.0f); XrFrameState fs{XR_TYPE_FRAME_STATE}; XrFrameWaitInfo wi{XR_TYPE_FRAME_WAIT_INFO}; if(!ok(xrWaitFrame(session,&wi,&fs),"xrWaitFrame")) return; XrFrameBeginInfo bi{XR_TYPE_FRAME_BEGIN_INFO}; xrBeginFrame(session,&bi); std::vector<XrCompositionLayerBaseHeader*> layers; XrCompositionLayerProjection layer{XR_TYPE_COMPOSITION_LAYER_PROJECTION}; if(fs.shouldRender){ XrViewLocateInfo li{XR_TYPE_VIEW_LOCATE_INFO}; li.viewConfigurationType=XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO; li.displayTime=fs.predictedDisplayTime; li.space=space; XrViewState vs{XR_TYPE_VIEW_STATE}; uint32_t vc=0; xrLocateViews(session,&li,&vs,(uint32_t)views.size(),&vc,views.data()); if(vc) syncActions(fs.predictedDisplayTime, views[0].pose); for(uint32_t i=0;i<vc;++i) renderView(i,views[i]); layer.space=space; layer.viewCount=vc; layer.views=projectionViews.data(); layers.push_back(reinterpret_cast<XrCompositionLayerBaseHeader*>(&layer)); } XrFrameEndInfo ei{XR_TYPE_FRAME_END_INFO}; ei.displayTime=fs.predictedDisplayTime; ei.environmentBlendMode=XR_ENVIRONMENT_BLEND_MODE_OPAQUE; ei.layerCount=(uint32_t)layers.size(); ei.layers=layers.empty()?nullptr:layers.data(); xrEndFrame(session,&ei); }
  void drawRect(float x,float y,float z,float w,float h,Color c,const Mat4& vp){ Mat4 mvp=mul(vp,mul(translate(x,y,z),scale(w,h,1))); glUniformMatrix4fv(glGetUniformLocation(program,"mvp"),1,GL_FALSE,mvp.m); glUniform4f(glGetUniformLocation(program,"col"),c.r,c.g,c.b,c.a); glDrawArrays(GL_TRIANGLES,0,6); }
  void drawBoardRect(float x,float y,float w,float h,Color c,const Mat4& vp){ drawRect(x, y, -1.98f, w, h, c, vp); }
  void drawScene(const XrView& view){ Mat4 vp=mul(projection(view.fov),viewFromPose(view.pose)); glUseProgram(program); glBindBuffer(GL_ARRAY_BUFFER,vbo); glEnableVertexAttribArray(0); glVertexAttribPointer(0,3,GL_FLOAT,GL_FALSE,12,reinterpret_cast<void*>(0)); glEnable(GL_BLEND); glBlendFunc(GL_SRC_ALPHA,GL_ONE_MINUS_SRC_ALPHA); drawRect(0,1.55f,-2.05f,1.78f,1.08f,{0.04f,0.06f,0.13f,0.96f},vp); drawRect(0,1.55f,-2.045f,1.90f,1.20f,{0.12f,0.20f,0.40f,0.32f},vp); for(int i=-2;i<16;++i){ Rect p=game.platformAt(i); drawBoardRect(p.x*0.24f, 1.16f+p.y*0.55f, p.w*0.24f, p.h*0.55f, p.color, vp); } drawBoardRect(0.0f,1.16f+game.playerY*0.55f,0.085f,0.15f,{1,1,1,1},vp); drawRect(game.pointerX,game.pointerY,-1.94f,0.035f,0.035f,{0.3f,0.9f,1.0f,0.9f},vp); for(const Particle& p:game.particles) drawRect(p.x,p.y,-1.93f,p.size,p.size,p.color,vp); }
  void renderView(uint32_t i,const XrView& view){ Swapchain& sw=swapchains[i]; uint32_t img=0; XrSwapchainImageAcquireInfo ai{XR_TYPE_SWAPCHAIN_IMAGE_ACQUIRE_INFO}; xrAcquireSwapchainImage(sw.handle,&ai,&img); XrSwapchainImageWaitInfo wait{XR_TYPE_SWAPCHAIN_IMAGE_WAIT_INFO}; wait.timeout=XR_INFINITE_DURATION; xrWaitSwapchainImage(sw.handle,&wait); GLuint fbo; glGenFramebuffers(1,&fbo); glBindFramebuffer(GL_FRAMEBUFFER,fbo); glFramebufferTexture2D(GL_FRAMEBUFFER,GL_COLOR_ATTACHMENT0,GL_TEXTURE_2D,sw.images[img].image,0); glViewport(0,0,sw.width,sw.height); glClearColor(0.015f,0.02f,0.045f,1.0f); glClear(GL_COLOR_BUFFER_BIT|GL_DEPTH_BUFFER_BIT); glEnable(GL_DEPTH_TEST); drawScene(view); glBindFramebuffer(GL_FRAMEBUFFER,0); glDeleteFramebuffers(1,&fbo); projectionViews[i]={XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW}; projectionViews[i].pose=view.pose; projectionViews[i].fov=view.fov; projectionViews[i].subImage.swapchain=sw.handle; projectionViews[i].subImage.imageRect.offset={0,0}; projectionViews[i].subImage.imageRect.extent={sw.width,sw.height}; XrSwapchainImageReleaseInfo ri{XR_TYPE_SWAPCHAIN_IMAGE_RELEASE_INFO}; xrReleaseSwapchainImage(sw.handle,&ri); }
  void shutdown(){ if(aimSpace) xrDestroySpace(aimSpace); if(jumpAction) xrDestroyAction(jumpAction); if(aimAction) xrDestroyAction(aimAction); if(actionSet) xrDestroyActionSet(actionSet); for(auto& sw:swapchains) if(sw.handle) xrDestroySwapchain(sw.handle); if(space) xrDestroySpace(space); if(session) xrDestroySession(session); if(instance) xrDestroyInstance(instance); if(program) glDeleteProgram(program); if(vbo) glDeleteBuffers(1,&vbo); if(display!=EGL_NO_DISPLAY){ eglMakeCurrent(display,EGL_NO_SURFACE,EGL_NO_SURFACE,EGL_NO_CONTEXT); if(surface!=EGL_NO_SURFACE) eglDestroySurface(display,surface); if(context!=EGL_NO_CONTEXT) eglDestroyContext(display,context); eglTerminate(display); } }

  android_app* app=nullptr; EndlessPlatformer game; bool exit=false,running=false,triggerDown=false; XrInstance instance{XR_NULL_HANDLE}; XrSystemId systemId{XR_NULL_SYSTEM_ID}; XrSession session{XR_NULL_HANDLE}; XrSpace space{XR_NULL_HANDLE}; XrActionSet actionSet{XR_NULL_HANDLE}; XrAction jumpAction{XR_NULL_HANDLE}; XrAction aimAction{XR_NULL_HANDLE}; XrPath rightHandPath{XR_NULL_PATH}; XrSpace aimSpace{XR_NULL_HANDLE}; EGLDisplay display{EGL_NO_DISPLAY}; EGLConfig eglConfig{}; EGLContext context{EGL_NO_CONTEXT}; EGLSurface surface{EGL_NO_SURFACE}; GLuint program=0,vbo=0; std::vector<XrViewConfigurationView> configViews; std::vector<XrView> views; std::vector<Swapchain> swapchains; std::vector<XrCompositionLayerProjectionView> projectionViews;
};

void android_main(android_app* app) { app_dummy(); Host host(app); host.run(); }
