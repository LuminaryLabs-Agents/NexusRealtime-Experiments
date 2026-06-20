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
#include <string>
#include <vector>

#define LOG_TAG "SpatialAuthoringOpenXR"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

struct Color { float r; float g; float b; float a; };
struct Object { std::string id; float x; float y; float w; float h; Color c; };
static float clampf(float v,float a,float b){ return std::max(a,std::min(v,b)); }
static XrPosef identityPose(){ XrPosef p{}; p.orientation.w=1.0f; return p; }
static bool ok(XrResult r,const char* label){ if(XR_FAILED(r)){ LOGE("%s failed %d",label,r); return false; } return true; }

class GuidedBridge {
public:
  GuidedBridge(){ reset(); LOGI("GuidedBridge: visible controller fallback demo active"); }
  void reset(){
    objects.clear();
    objects.push_back({"blue-panel",0.24f,0.58f,0.28f,0.20f,{0.10f,0.42f,1.00f,1}});
    objects.push_back({"gold-note",0.50f,0.56f,0.24f,0.18f,{0.96f,0.66f,0.16f,1}});
    objects.push_back({"teal-timer",0.76f,0.58f,0.24f,0.18f,{0.08f,0.82f,0.72f,1}});
    stage=0; selected=0; snapshots=0; cursorX=0.50f; cursorY=0.38f; lastClickFrame=frame; autoMode=true;
  }
  void tick(){
    frame++;
    pulse=0.5f+0.5f*std::sin((float)frame*0.08f);
    if(autoMode && frame-lastClickFrame>210){ click("auto"); lastClickFrame=frame; }
    if(stage==1 && objects.size()>1){ objects[1].x=0.50f+(cursorX-0.50f)*0.55f; objects[1].y=0.56f+(cursorY-0.56f)*0.30f; }
    cursorX=clampf(cursorX+axisX*0.018f,0.10f,0.90f);
    cursorY=clampf(cursorY+axisY*0.018f,0.14f,0.84f);
  }
  void setAxis(float x,float y){ axisX=clampf(x,-1,1); axisY=clampf(y,-1,1); autoMode=false; }
  void setCursorFromPose(const XrQuaternionf& q,bool inverse){
    float sinYaw=2.0f*(q.w*q.y+q.x*q.z); float cosYaw=1.0f-2.0f*(q.y*q.y+q.z*q.z); float yaw=std::atan2(sinYaw,cosYaw);
    float sinPitch=clampf(2.0f*(q.w*q.x-q.z*q.y),-1,1); float pitch=std::asin(sinPitch);
    cursorX=clampf(0.50f+(inverse?-1.0f:1.0f)*yaw*0.70f,0.10f,0.90f);
    cursorY=clampf(0.50f-(inverse?-1.0f:1.0f)*pitch*0.80f,0.14f,0.84f);
  }
  void click(const char* source){
    autoMode=false; lastClickFrame=frame; int hit=hitTest(cursorX,cursorY); if(hit>=0) selected=hit;
    if(stage==0){ selected=hit>=0?hit:0; stage=1; LOGI("DSK step: SELECT via %s selected=%d",source,selected); return; }
    if(stage==1){ if(objects.size()>1){ objects[1].x=cursorX; objects[1].y=cursorY; } selected=1; stage=2; LOGI("DSK step: MOVE via %s",source); return; }
    if(stage==2){ objects.push_back({"created-widget",cursorX,cursorY,0.25f,0.16f,{1.0f,0.95f,0.25f,1}}); selected=(int)objects.size()-1; stage=3; LOGI("DSK step: CREATE via %s",source); return; }
    if(stage==3){ selected=2; if(objects.size()>2){ objects[2].w=0.34f; objects[2].h=0.25f; } stage=4; LOGI("DSK step: RESIZE via %s",source); return; }
    if(stage==4){ snapshots++; stage=5; LOGI("DSK step: SNAPSHOT via %s snapshots=%u",source,snapshots); return; }
    reset(); stage=0; LOGI("DSK step: RESET via %s",source);
  }
  int hitTest(float x,float y) const { for(int i=(int)objects.size()-1;i>=0;--i){ const auto&o=objects[(size_t)i]; if(std::fabs(x-o.x)<=o.w*0.62f && std::fabs(y-o.y)<=o.h*0.62f) return i; } return -1; }
  const std::vector<Object>& getObjects()const{return objects;} int getSelected()const{return selected;} int getStage()const{return stage;} float getPulse()const{return pulse;} float getCursorX()const{return cursorX;} float getCursorY()const{return cursorY;} bool flash()const{return frame-lastClickFrame<24;} unsigned getSnapshots()const{return snapshots;} bool isAuto()const{return autoMode;}
private:
  std::vector<Object> objects; int stage=0; int selected=0; unsigned snapshots=0; unsigned long long frame=0,lastClickFrame=0; float pulse=0,cursorX=0.5f,cursorY=0.5f,axisX=0,axisY=0; bool autoMode=true;
};

class App {
public:
  explicit App(android_app* app):app(app){}
  void run(){
    app->userData=this;
    app->onAppCmd=[](android_app*a,int32_t c){ if(c==APP_CMD_DESTROY) static_cast<App*>(a->userData)->exit=true; };
    app->onInputEvent=[](android_app*a,AInputEvent*e)->int32_t{ return static_cast<App*>(a->userData)->input(e); };
    if(!init()) LOGE("OpenXR init failed");
    while(!exit && !app->destroyRequested){ int events=0; android_poll_source* source=nullptr; while(ALooper_pollOnce(running?0:100,nullptr,&events,reinterpret_cast<void**>(&source))>=0){ if(source) source->process(app,source); if(app->destroyRequested) exit=true; } poll(); if(running) frame(); }
    shutdown();
  }
private:
  struct Swapchain{ XrSwapchain h{XR_NULL_HANDLE}; int32_t w=0,hgt=0; std::vector<XrSwapchainImageOpenGLESKHR> imgs; };
  bool init(){ return initLoader()&&createInstance()&&createActions()&&getSystem()&&initEgl()&&createSession()&&attachActions()&&createActionSpace()&&createRefSpace()&&createSwapchains(); }
  int32_t input(AInputEvent* e){
    int type=AInputEvent_getType(e);
    if(type==AINPUT_EVENT_TYPE_KEY){ int action=AKeyEvent_getAction(e); int key=AKeyEvent_getKeyCode(e); if(action==AKEY_EVENT_ACTION_UP && isClickKey(key)){ bridge.click("android-key"); return 1; } return 0; }
    if(type==AINPUT_EVENT_TYPE_MOTION){ int action=AMotionEvent_getAction(e)&AMOTION_EVENT_ACTION_MASK; float x=AMotionEvent_getAxisValue(e,AMOTION_EVENT_AXIS_X,0); float y=AMotionEvent_getAxisValue(e,AMOTION_EVENT_AXIS_Y,0); float hx=AMotionEvent_getAxisValue(e,AMOTION_EVENT_AXIS_HAT_X,0); float hy=AMotionEvent_getAxisValue(e,AMOTION_EVENT_AXIS_HAT_Y,0); if(std::fabs(hx)>std::fabs(x)) x=hx; if(std::fabs(hy)>std::fabs(y)) y=hy; bridge.setAxis(x,y); if(action==AMOTION_EVENT_ACTION_UP || action==AMOTION_EVENT_ACTION_BUTTON_RELEASE){ bridge.click("android-motion"); return 1; } return 1; }
    return 0;
  }
  bool isClickKey(int k) const { switch(k){ case AKEYCODE_BUTTON_A: case AKEYCODE_BUTTON_B: case AKEYCODE_BUTTON_X: case AKEYCODE_BUTTON_Y: case AKEYCODE_BUTTON_L1: case AKEYCODE_BUTTON_R1: case AKEYCODE_BUTTON_L2: case AKEYCODE_BUTTON_R2: case AKEYCODE_BUTTON_THUMBL: case AKEYCODE_BUTTON_THUMBR: case AKEYCODE_DPAD_CENTER: case AKEYCODE_ENTER: case AKEYCODE_SPACE: return true; default: return false; } }
  bool initLoader(){ PFN_xrInitializeLoaderKHR fn=nullptr; xrGetInstanceProcAddr(XR_NULL_HANDLE,"xrInitializeLoaderKHR",reinterpret_cast<PFN_xrVoidFunction*>(&fn)); if(!fn) return true; XrLoaderInitInfoAndroidKHR info{XR_TYPE_LOADER_INIT_INFO_ANDROID_KHR}; info.applicationVM=app->activity->vm; info.applicationContext=app->activity->clazz; return ok(fn(reinterpret_cast<XrLoaderInitInfoBaseHeaderKHR*>(&info)),"xrInitializeLoaderKHR"); }
  bool hasExt(const char*n,const std::vector<XrExtensionProperties>&xs){ for(auto&x:xs) if(std::strcmp(x.extensionName,n)==0) return true; return false; }
  bool createInstance(){ uint32_t c=0; xrEnumerateInstanceExtensionProperties(nullptr,0,&c,nullptr); std::vector<XrExtensionProperties> xs(c,{XR_TYPE_EXTENSION_PROPERTIES}); xrEnumerateInstanceExtensionProperties(nullptr,c,&c,xs.data()); std::vector<const char*> ex={XR_KHR_ANDROID_CREATE_INSTANCE_EXTENSION_NAME,XR_KHR_OPENGL_ES_ENABLE_EXTENSION_NAME}; if(hasExt(XR_EXT_HAND_TRACKING_EXTENSION_NAME,xs)) ex.push_back(XR_EXT_HAND_TRACKING_EXTENSION_NAME); XrInstanceCreateInfoAndroidKHR ai{XR_TYPE_INSTANCE_CREATE_INFO_ANDROID_KHR}; ai.applicationVM=app->activity->vm; ai.applicationActivity=app->activity->clazz; XrInstanceCreateInfo ci{XR_TYPE_INSTANCE_CREATE_INFO}; ci.next=&ai; ci.enabledExtensionCount=(uint32_t)ex.size(); ci.enabledExtensionNames=ex.data(); std::strncpy(ci.applicationInfo.applicationName,"Spatial Authoring OpenXR",XR_MAX_APPLICATION_NAME_SIZE-1); std::strncpy(ci.applicationInfo.engineName,"NexusRealtime",XR_MAX_ENGINE_NAME_SIZE-1); ci.applicationInfo.apiVersion=XR_CURRENT_API_VERSION; return ok(xrCreateInstance(&ci,&instance),"xrCreateInstance"); }
  bool createActions(){ if(instance==XR_NULL_HANDLE) return false; XrActionSetCreateInfo si{XR_TYPE_ACTION_SET_CREATE_INFO}; std::strncpy(si.actionSetName,"spatial_authoring",XR_MAX_ACTION_SET_NAME_SIZE-1); std::strncpy(si.localizedActionSetName,"Spatial Authoring",XR_MAX_LOCALIZED_ACTION_SET_NAME_SIZE-1); if(!ok(xrCreateActionSet(instance,&si,&actionSet),"xrCreateActionSet")) return false; xrStringToPath(instance,"/user/hand/right",&rightHand); XrActionCreateInfo bi{XR_TYPE_ACTION_CREATE_INFO}; bi.actionType=XR_ACTION_TYPE_BOOLEAN_INPUT; std::strncpy(bi.actionName,"right_select",XR_MAX_ACTION_NAME_SIZE-1); std::strncpy(bi.localizedActionName,"Right Select",XR_MAX_LOCALIZED_ACTION_NAME_SIZE-1); bi.countSubactionPaths=1; bi.subactionPaths=&rightHand; if(!ok(xrCreateAction(actionSet,&bi,&selectAction),"xrCreateAction select")) return false; XrActionCreateInfo pi{XR_TYPE_ACTION_CREATE_INFO}; pi.actionType=XR_ACTION_TYPE_POSE_INPUT; std::strncpy(pi.actionName,"right_aim_pose",XR_MAX_ACTION_NAME_SIZE-1); std::strncpy(pi.localizedActionName,"Right Aim Pose",XR_MAX_LOCALIZED_ACTION_NAME_SIZE-1); pi.countSubactionPaths=1; pi.subactionPaths=&rightHand; if(!ok(xrCreateAction(actionSet,&pi,&aimAction),"xrCreateAction aim")) return false; suggest("/interaction_profiles/khr/simple_controller","/user/hand/right/input/select/click","/user/hand/right/input/aim/pose"); return true; }
  void suggest(const char*profileName,const char*selectName,const char*aimName){ XrPath profile,sel,aim; xrStringToPath(instance,profileName,&profile); xrStringToPath(instance,selectName,&sel); xrStringToPath(instance,aimName,&aim); XrActionSuggestedBinding bs[2]={{selectAction,sel},{aimAction,aim}}; XrInteractionProfileSuggestedBinding sb{XR_TYPE_INTERACTION_PROFILE_SUGGESTED_BINDING}; sb.interactionProfile=profile; sb.countSuggestedBindings=2; sb.suggestedBindings=bs; XrResult r=xrSuggestInteractionProfileBindings(instance,&sb); if(XR_FAILED(r)) LOGE("binding suggestion failed %s %d",profileName,r); }
  bool getSystem(){ XrSystemGetInfo i{XR_TYPE_SYSTEM_GET_INFO}; i.formFactor=XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY; return ok(xrGetSystem(instance,&i,&systemId),"xrGetSystem"); }
  bool initEgl(){ display=eglGetDisplay(EGL_DEFAULT_DISPLAY); if(display==EGL_NO_DISPLAY||!eglInitialize(display,nullptr,nullptr)) return false; const EGLint attrs[]={EGL_RENDERABLE_TYPE,EGL_OPENGL_ES3_BIT,EGL_SURFACE_TYPE,EGL_PBUFFER_BIT,EGL_RED_SIZE,8,EGL_GREEN_SIZE,8,EGL_BLUE_SIZE,8,EGL_ALPHA_SIZE,8,EGL_NONE}; EGLint n=0; if(!eglChooseConfig(display,attrs,&config,1,&n)||n<1) return false; const EGLint ca[]={EGL_CONTEXT_CLIENT_VERSION,3,EGL_NONE}; context=eglCreateContext(display,config,EGL_NO_CONTEXT,ca); if(context==EGL_NO_CONTEXT) return false; const EGLint pa[]={EGL_WIDTH,16,EGL_HEIGHT,16,EGL_NONE}; surface=eglCreatePbufferSurface(display,config,pa); return surface!=EGL_NO_SURFACE && eglMakeCurrent(display,surface,surface,context); }
  bool createSession(){ PFN_xrGetOpenGLESGraphicsRequirementsKHR req=nullptr; xrGetInstanceProcAddr(instance,"xrGetOpenGLESGraphicsRequirementsKHR",reinterpret_cast<PFN_xrVoidFunction*>(&req)); if(!req) return false; XrGraphicsRequirementsOpenGLESKHR gr{XR_TYPE_GRAPHICS_REQUIREMENTS_OPENGL_ES_KHR}; if(!ok(req(instance,systemId,&gr),"xrGetOpenGLESGraphicsRequirementsKHR")) return false; XrGraphicsBindingOpenGLESAndroidKHR bind{XR_TYPE_GRAPHICS_BINDING_OPENGL_ES_ANDROID_KHR}; bind.display=display; bind.config=config; bind.context=context; XrSessionCreateInfo si{XR_TYPE_SESSION_CREATE_INFO}; si.next=&bind; si.systemId=systemId; return ok(xrCreateSession(instance,&si,&session),"xrCreateSession"); }
  bool attachActions(){ XrSessionActionSetsAttachInfo ai{XR_TYPE_SESSION_ACTION_SETS_ATTACH_INFO}; ai.countActionSets=1; ai.actionSets=&actionSet; return ok(xrAttachSessionActionSets(session,&ai),"xrAttachSessionActionSets"); }
  bool createActionSpace(){ XrActionSpaceCreateInfo i{XR_TYPE_ACTION_SPACE_CREATE_INFO}; i.action=aimAction; i.subactionPath=rightHand; i.poseInActionSpace=identityPose(); return ok(xrCreateActionSpace(session,&i,&aimSpace),"xrCreateActionSpace"); }
  bool createRefSpace(){ XrReferenceSpaceCreateInfo i{XR_TYPE_REFERENCE_SPACE_CREATE_INFO}; i.referenceSpaceType=XR_REFERENCE_SPACE_TYPE_LOCAL; i.poseInReferenceSpace=identityPose(); return ok(xrCreateReferenceSpace(session,&i,&space),"xrCreateReferenceSpace"); }
  int64_t chooseFormat(){ uint32_t c=0; xrEnumerateSwapchainFormats(session,0,&c,nullptr); std::vector<int64_t> f(c); xrEnumerateSwapchainFormats(session,c,&c,f.data()); return f.empty()?GL_RGBA8:f[0]; }
  bool createSwapchains(){ uint32_t vc=0; xrEnumerateViewConfigurationViews(instance,systemId,XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO,0,&vc,nullptr); configViews.resize(vc,{XR_TYPE_VIEW_CONFIGURATION_VIEW}); xrEnumerateViewConfigurationViews(instance,systemId,XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO,vc,&vc,configViews.data()); views.resize(vc,{XR_TYPE_VIEW}); swapchains.resize(vc); projectionViews.resize(vc,{XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW}); for(uint32_t i=0;i<vc;i++){ XrSwapchainCreateInfo info{XR_TYPE_SWAPCHAIN_CREATE_INFO}; info.usageFlags=XR_SWAPCHAIN_USAGE_COLOR_ATTACHMENT_BIT; info.format=chooseFormat(); info.sampleCount=configViews[i].recommendedSwapchainSampleCount; info.width=configViews[i].recommendedImageRectWidth; info.height=configViews[i].recommendedImageRectHeight; info.faceCount=1; info.arraySize=1; info.mipCount=1; if(!ok(xrCreateSwapchain(session,&info,&swapchains[i].h),"xrCreateSwapchain")) return false; swapchains[i].w=(int32_t)info.width; swapchains[i].hgt=(int32_t)info.height; uint32_t ic=0; xrEnumerateSwapchainImages(swapchains[i].h,0,&ic,nullptr); swapchains[i].imgs.resize(ic,{XR_TYPE_SWAPCHAIN_IMAGE_OPENGL_ES_KHR}); xrEnumerateSwapchainImages(swapchains[i].h,ic,&ic,reinterpret_cast<XrSwapchainImageBaseHeader*>(swapchains[i].imgs.data())); } return true; }
  void poll(){ XrEventDataBuffer e{XR_TYPE_EVENT_DATA_BUFFER}; while(instance!=XR_NULL_HANDLE&&xrPollEvent(instance,&e)==XR_SUCCESS){ if(e.type==XR_TYPE_EVENT_DATA_SESSION_STATE_CHANGED){ auto*s=reinterpret_cast<XrEventDataSessionStateChanged*>(&e); if(s->state==XR_SESSION_STATE_READY){ XrSessionBeginInfo bi{XR_TYPE_SESSION_BEGIN_INFO}; bi.primaryViewConfigurationType=XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO; if(ok(xrBeginSession(session,&bi),"xrBeginSession")) running=true; } else if(s->state==XR_SESSION_STATE_STOPPING){ xrEndSession(session); running=false; } else if(s->state==XR_SESSION_STATE_EXITING||s->state==XR_SESSION_STATE_LOSS_PENDING) exit=true; } e={XR_TYPE_EVENT_DATA_BUFFER}; } }
  void syncController(XrTime t){ XrActiveActionSet as{actionSet,XR_NULL_PATH}; XrActionsSyncInfo si{XR_TYPE_ACTIONS_SYNC_INFO}; si.countActiveActionSets=1; si.activeActionSets=&as; xrSyncActions(session,&si); XrActionStateGetInfo gi{XR_TYPE_ACTION_STATE_GET_INFO}; gi.action=selectAction; gi.subactionPath=rightHand; XrActionStateBoolean st{XR_TYPE_ACTION_STATE_BOOLEAN}; if(XR_SUCCEEDED(xrGetActionStateBoolean(session,&gi,&st))&&st.isActive){ if(st.currentState&&!lastSelect) bridge.click("openxr-select"); lastSelect=st.currentState; } else lastSelect=false; if(aimSpace!=XR_NULL_HANDLE){ XrSpaceLocation loc{XR_TYPE_SPACE_LOCATION}; if(XR_SUCCEEDED(xrLocateSpace(aimSpace,space,t,&loc)) && (loc.locationFlags&XR_SPACE_LOCATION_ORIENTATION_VALID_BIT)){ bridge.setCursorFromPose(loc.pose.orientation,false); controllerPose=true; return; } } controllerPose=false; }
  void frame(){ bridge.tick(); XrFrameState fs{XR_TYPE_FRAME_STATE}; XrFrameWaitInfo wi{XR_TYPE_FRAME_WAIT_INFO}; if(!ok(xrWaitFrame(session,&wi,&fs),"xrWaitFrame")) return; syncController(fs.predictedDisplayTime); XrFrameBeginInfo bi{XR_TYPE_FRAME_BEGIN_INFO}; xrBeginFrame(session,&bi); std::vector<XrCompositionLayerBaseHeader*> layers; XrCompositionLayerProjection layer{XR_TYPE_COMPOSITION_LAYER_PROJECTION}; if(fs.shouldRender){ XrViewLocateInfo li{XR_TYPE_VIEW_LOCATE_INFO}; li.viewConfigurationType=XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO; li.displayTime=fs.predictedDisplayTime; li.space=space; XrViewState vs{XR_TYPE_VIEW_STATE}; uint32_t vc=0; xrLocateViews(session,&li,&vs,(uint32_t)views.size(),&vc,views.data()); if(vc>0&&!controllerPose) bridge.setCursorFromPose(views[0].pose.orientation,true); for(uint32_t i=0;i<vc;i++) renderView(i,views[i]); layer.space=space; layer.viewCount=vc; layer.views=projectionViews.data(); layers.push_back((XrCompositionLayerBaseHeader*)&layer); } XrFrameEndInfo ei{XR_TYPE_FRAME_END_INFO}; ei.displayTime=fs.predictedDisplayTime; ei.environmentBlendMode=XR_ENVIRONMENT_BLEND_MODE_OPAQUE; ei.layerCount=(uint32_t)layers.size(); ei.layers=layers.empty()?nullptr:layers.data(); xrEndFrame(session,&ei); }
  void rect(const Swapchain&sc,float cx,float cy,float sx,float sy,Color c){ int w=std::max(1,(int)(sc.w*sx)); int h=std::max(1,(int)(sc.hgt*sy)); int x=(int)(sc.w*cx)-w/2; int y=(int)(sc.hgt*cy)-h/2; int x0=std::max(0,x),y0=std::max(0,y),x1=std::min(sc.w,x+w),y1=std::min(sc.hgt,y+h); if(x1<=x0||y1<=y0)return; glScissor(x0,y0,x1-x0,y1-y0); glClearColor(c.r,c.g,c.b,c.a); glClear(GL_COLOR_BUFFER_BIT); }
  void renderOverlay(const Swapchain&sc){ glEnable(GL_SCISSOR_TEST); for(int i=0;i<6;i++){ Color p=i<=bridge.getStage()?Color{0.75f,1,0.35f,1}:Color{0.10f,0.15f,0.20f,1}; rect(sc,0.18f+i*0.13f,0.88f,0.08f,0.035f,p); } for(size_t i=0;i<bridge.getObjects().size();++i){ const auto&o=bridge.getObjects()[i]; if((int)i==bridge.getSelected()) rect(sc,o.x,o.y,o.w+0.030f,o.h+0.036f,{1,1,0.25f,1}); rect(sc,o.x,o.y,o.w,o.h,o.c); } if(bridge.getStage()==5) rect(sc,0.50f,0.18f,0.30f+0.08f*bridge.getPulse(),0.060f,{0.10f,1.0f,0.25f,1}); else rect(sc,0.50f,0.18f,0.22f,0.045f,{0.15f,0.30f,0.45f,1}); Color cur=bridge.flash()?Color{1,0.88f,0.10f,1}:controllerPose?Color{1,1,1,1}:bridge.isAuto()?Color{1,0.25f,0.25f,1}:Color{0.45f,0.72f,1,1}; rect(sc,bridge.getCursorX(),bridge.getCursorY(),0.07f,0.010f,cur); rect(sc,bridge.getCursorX(),bridge.getCursorY(),0.010f,0.07f,cur); rect(sc,bridge.getCursorX(),bridge.getCursorY(),0.025f,0.025f,{0.08f,0.44f,1,1}); glDisable(GL_SCISSOR_TEST); }
  void renderView(uint32_t i,const XrView&view){ auto&sc=swapchains[i]; uint32_t img=0; XrSwapchainImageAcquireInfo ai{XR_TYPE_SWAPCHAIN_IMAGE_ACQUIRE_INFO}; xrAcquireSwapchainImage(sc.h,&ai,&img); XrSwapchainImageWaitInfo wi{XR_TYPE_SWAPCHAIN_IMAGE_WAIT_INFO}; wi.timeout=XR_INFINITE_DURATION; xrWaitSwapchainImage(sc.h,&wi); GLuint fbo=0; glGenFramebuffers(1,&fbo); glBindFramebuffer(GL_FRAMEBUFFER,fbo); glFramebufferTexture2D(GL_FRAMEBUFFER,GL_COLOR_ATTACHMENT0,GL_TEXTURE_2D,sc.imgs[img].image,0); glViewport(0,0,sc.w,sc.hgt); glDisable(GL_SCISSOR_TEST); glClearColor(0.02f,controllerPose?0.12f:0.06f,0.12f,1); glClear(GL_COLOR_BUFFER_BIT); renderOverlay(sc); glBindFramebuffer(GL_FRAMEBUFFER,0); glDeleteFramebuffers(1,&fbo); projectionViews[i]={XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW}; projectionViews[i].pose=view.pose; projectionViews[i].fov=view.fov; projectionViews[i].subImage.swapchain=sc.h; projectionViews[i].subImage.imageRect.offset={0,0}; projectionViews[i].subImage.imageRect.extent={sc.w,sc.hgt}; XrSwapchainImageReleaseInfo ri{XR_TYPE_SWAPCHAIN_IMAGE_RELEASE_INFO}; xrReleaseSwapchainImage(sc.h,&ri); }
  void shutdown(){ if(aimSpace!=XR_NULL_HANDLE)xrDestroySpace(aimSpace); if(selectAction!=XR_NULL_HANDLE)xrDestroyAction(selectAction); if(aimAction!=XR_NULL_HANDLE)xrDestroyAction(aimAction); if(actionSet!=XR_NULL_HANDLE)xrDestroyActionSet(actionSet); for(auto&sc:swapchains) if(sc.h!=XR_NULL_HANDLE) xrDestroySwapchain(sc.h); if(space!=XR_NULL_HANDLE)xrDestroySpace(space); if(session!=XR_NULL_HANDLE)xrDestroySession(session); if(instance!=XR_NULL_HANDLE)xrDestroyInstance(instance); if(display!=EGL_NO_DISPLAY){ eglMakeCurrent(display,EGL_NO_SURFACE,EGL_NO_SURFACE,EGL_NO_CONTEXT); if(surface!=EGL_NO_SURFACE)eglDestroySurface(display,surface); if(context!=EGL_NO_CONTEXT)eglDestroyContext(display,context); eglTerminate(display); } }
  android_app* app=nullptr; GuidedBridge bridge; bool exit=false,running=false,lastSelect=false,controllerPose=false; XrInstance instance{XR_NULL_HANDLE}; XrSystemId systemId{XR_NULL_SYSTEM_ID}; XrSession session{XR_NULL_HANDLE}; XrSpace space{XR_NULL_HANDLE}; XrActionSet actionSet{XR_NULL_HANDLE}; XrAction selectAction{XR_NULL_HANDLE}; XrAction aimAction{XR_NULL_HANDLE}; XrPath rightHand{XR_NULL_PATH}; XrSpace aimSpace{XR_NULL_HANDLE}; EGLDisplay display{EGL_NO_DISPLAY}; EGLConfig config{}; EGLContext context{EGL_NO_CONTEXT}; EGLSurface surface{EGL_NO_SURFACE}; std::vector<XrViewConfigurationView> configViews; std::vector<XrView> views; std::vector<Swapchain> swapchains; std::vector<XrCompositionLayerProjectionView> projectionViews;
};

void android_main(android_app* app){ app_dummy(); App runtime(app); runtime.run(); }
