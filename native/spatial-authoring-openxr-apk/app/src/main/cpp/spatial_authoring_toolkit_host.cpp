#include <android/asset_manager.h>
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
struct Vec3 { float x; float y; float z; };
struct Mat4 { float m[16]; };
struct RectEntity {
  std::string id;
  std::string dsk;
  int type;
  float x;
  float y;
  float z;
  float w;
  float h;
  Color color;
  int colorIndex;
  int effectIndex;
  bool movable;
};

enum EntityType {
  NOTE_CARD_SPAWNER = 1,
  PARTICLE_FUNNEL_SPAWNER = 2,
  MEADOW_PORTAL = 3,
  NOTE_CARD = 4,
  PARTICLE = 5,
  MEADOW_PROP = 6
};

static float clampf(float v, float lo, float hi) { return std::max(lo, std::min(v, hi)); }
static bool ok(XrResult result, const char* label) {
  if (XR_FAILED(result)) {
    LOGE("%s failed: %d", label, result);
    return false;
  }
  return true;
}
static XrPosef identityPose() {
  XrPosef pose{};
  pose.orientation.w = 1.0f;
  return pose;
}
static Mat4 identity() {
  Mat4 r{};
  r.m[0] = r.m[5] = r.m[10] = r.m[15] = 1.0f;
  return r;
}
static Mat4 translate(float x, float y, float z) {
  Mat4 r = identity();
  r.m[12] = x;
  r.m[13] = y;
  r.m[14] = z;
  return r;
}
static Mat4 scale(float x, float y, float z) {
  Mat4 r = identity();
  r.m[0] = x;
  r.m[5] = y;
  r.m[10] = z;
  return r;
}
static Mat4 mul(const Mat4& a, const Mat4& b) {
  Mat4 r{};
  for (int c = 0; c < 4; ++c) {
    for (int row = 0; row < 4; ++row) {
      for (int k = 0; k < 4; ++k) {
        r.m[c * 4 + row] += a.m[k * 4 + row] * b.m[c * 4 + k];
      }
    }
  }
  return r;
}
static Mat4 projection(const XrFovf& fov) {
  const float l = std::tan(fov.angleLeft);
  const float r = std::tan(fov.angleRight);
  const float d = std::tan(fov.angleDown);
  const float u = std::tan(fov.angleUp);
  const float w = r - l;
  const float h = u - d;
  const float n = 0.05f;
  const float far = 80.0f;
  Mat4 m{};
  m.m[0] = 2.0f / w;
  m.m[5] = 2.0f / h;
  m.m[8] = (r + l) / w;
  m.m[9] = (u + d) / h;
  m.m[10] = -(far + n) / (far - n);
  m.m[11] = -1.0f;
  m.m[14] = -(2.0f * far * n) / (far - n);
  return m;
}
static Mat4 viewFromPose(const XrPosef& pose) {
  const XrQuaternionf q = pose.orientation;
  const float x = -q.x;
  const float y = -q.y;
  const float z = -q.z;
  const float w = q.w;
  Mat4 r = identity();
  r.m[0] = 1.0f - 2.0f * y * y - 2.0f * z * z;
  r.m[1] = 2.0f * x * y + 2.0f * w * z;
  r.m[2] = 2.0f * x * z - 2.0f * w * y;
  r.m[4] = 2.0f * x * y - 2.0f * w * z;
  r.m[5] = 1.0f - 2.0f * x * x - 2.0f * z * z;
  r.m[6] = 2.0f * y * z + 2.0f * w * x;
  r.m[8] = 2.0f * x * z + 2.0f * w * y;
  r.m[9] = 2.0f * y * z - 2.0f * w * x;
  r.m[10] = 1.0f - 2.0f * x * x - 2.0f * y * y;
  return mul(r, translate(-pose.position.x, -pose.position.y, -pose.position.z));
}
static Vec3 rotateVector(const XrQuaternionf& q, Vec3 v) {
  Vec3 u{q.x, q.y, q.z};
  const float s = q.w;
  Vec3 a{u.y * v.z - u.z * v.y, u.z * v.x - u.x * v.z, u.x * v.y - u.y * v.x};
  Vec3 b{u.y * a.z - u.z * a.y, u.z * a.x - u.x * a.z, u.x * a.y - u.y * a.x};
  return {v.x + 2.0f * (s * a.x + b.x), v.y + 2.0f * (s * a.y + b.y), v.z + 2.0f * (s * a.z + b.z)};
}

class ToolkitState {
public:
  Color noteColors[5] = {
    {1.0f, 0.86f, 0.24f, 0.95f},
    {1.0f, 0.48f, 0.12f, 0.95f},
    {0.30f, 0.90f, 0.38f, 0.95f},
    {0.25f, 0.55f, 1.0f, 0.95f},
    {1.0f, 0.18f, 0.18f, 0.95f}
  };

  std::vector<RectEntity> entities;
  bool immersiveMeadow = false;
  bool hasInput = false;
  bool gripHeld = false;
  bool attachedNote = false;
  int selected = -1;
  int attachedIndex = -1;
  int currentNoteColor = 0;
  int particleEffect = 0;
  float pointerX = 0.0f;
  float pointerY = 1.12f;
  float offsetX = 0.0f;
  float offsetY = 0.0f;
  float axisX = 0.0f;
  float axisY = 0.0f;
  float navX = 0.0f;
  float navZ = 0.0f;
  unsigned long long frame = 0;
  unsigned long long lastAutoFrame = 0;

  void resetFromDskContract() {
    entities.clear();
    entities.push_back({"note-card-spawner", "note-card-spawner-dsk", NOTE_CARD_SPAWNER, -0.72f, 1.20f, -2.0f, 0.46f, 0.34f, {1.0f, 0.84f, 0.12f, 0.75f}, 0, 0, true});
    entities.push_back({"particle-funnel-spawner", "particle-funnel-spawner-dsk", PARTICLE_FUNNEL_SPAWNER, 0.0f, 1.20f, -2.0f, 0.46f, 0.34f, {0.30f, 0.82f, 1.0f, 0.75f}, 0, 0, true});
    entities.push_back({"meadow-portal", "portal-transition-dsk", MEADOW_PORTAL, 0.72f, 1.20f, -2.05f, 0.42f, 0.68f, {0.70f, 0.18f, 1.0f, 0.76f}, 0, 0, true});
    immersiveMeadow = false;
    gripHeld = false;
    attachedNote = false;
    selected = -1;
    attachedIndex = -1;
    currentNoteColor = 0;
    particleEffect = 0;
    pointerX = 0.0f;
    pointerY = 1.12f;
    axisX = axisY = navX = navZ = 0.0f;
    LOGI("DSK host reset: note-card-spawner, particle-funnel-spawner, meadow-portal loaded");
  }

  void tick() {
    frame++;
    if (!hasInput && frame - lastAutoFrame > 480) {
      lastAutoFrame = frame;
      cycleParticleEffect();
    }
    if (immersiveMeadow) {
      navX += axisX * 0.035f;
      navZ += axisY * 0.045f;
    } else {
      pointerX = clampf(pointerX + axisX * 0.035f, -1.35f, 1.35f);
      pointerY = clampf(pointerY - axisY * 0.032f, 0.50f, 1.90f);
    }
    if (gripHeld && selected >= 0 && selected < static_cast<int>(entities.size())) {
      entities[(size_t)selected].x = clampf(pointerX + offsetX, -1.35f, 1.35f);
      entities[(size_t)selected].y = clampf(pointerY + offsetY, 0.55f, 1.85f);
    }
    if (attachedNote && attachedIndex >= 0 && attachedIndex < static_cast<int>(entities.size())) {
      RectEntity& note = entities[(size_t)attachedIndex];
      note.x = pointerX;
      note.y = pointerY;
      note.z = -1.82f;
      note.color = noteColors[currentNoteColor];
      note.colorIndex = currentNoteColor;
    }
    emitParticles();
  }

  void setPointer(float x, float y) {
    if (!immersiveMeadow) {
      pointerX = clampf(x, -1.35f, 1.35f);
      pointerY = clampf(y, 0.50f, 1.90f);
    }
  }
  void setAxis(float x, float y) {
    hasInput = true;
    axisX = clampf(x, -1.0f, 1.0f);
    axisY = clampf(y, -1.0f, 1.0f);
  }

  int hitTest() const {
    for (int i = static_cast<int>(entities.size()) - 1; i >= 0; --i) {
      const RectEntity& e = entities[(size_t)i];
      if (e.type == PARTICLE || e.type == MEADOW_PROP) continue;
      if (std::fabs(pointerX - e.x) <= e.w * 0.66f && std::fabs(pointerY - e.y) <= e.h * 0.66f) return i;
    }
    return -1;
  }

  void gripDown() {
    hasInput = true;
    if (attachedNote) {
      currentNoteColor = (currentNoteColor + 1) % 5;
      LOGI("DSK note-card-spawner-dsk: grip cycles attached note color=%d", currentNoteColor);
      return;
    }
    const int hit = hitTest();
    if (hit >= 0 && entities[(size_t)hit].movable) {
      selected = hit;
      gripHeld = true;
      offsetX = entities[(size_t)hit].x - pointerX;
      offsetY = entities[(size_t)hit].y - pointerY;
      LOGI("DSK transform-dsk: grip grabbed entity=%s", entities[(size_t)hit].id.c_str());
    }
  }
  void gripUp() {
    if (gripHeld && selected >= 0) LOGI("DSK transform-dsk: grip dropped entity=%s", entities[(size_t)selected].id.c_str());
    gripHeld = false;
  }

  void triggerDown() {
    hasInput = true;
    const int hit = hitTest();
    if (attachedNote) {
      attachedNote = false;
      LOGI("DSK note-card-spawner-dsk: trigger placed note-card index=%d", attachedIndex);
      attachedIndex = -1;
      return;
    }
    if (hit >= 0) {
      RectEntity& entity = entities[(size_t)hit];
      if (entity.type == NOTE_CARD_SPAWNER) { spawnAttachedNoteCard(); return; }
      if (entity.type == PARTICLE_FUNNEL_SPAWNER) { cycleParticleEffect(); return; }
      if (entity.type == MEADOW_PORTAL) { enterMeadow(); return; }
    }
    spawnAttachedNoteCard();
  }
  void triggerUp() {}

  void spawnAttachedNoteCard() {
    entities.push_back({"note-card", "note-card-spawner-dsk", NOTE_CARD, pointerX, pointerY, -1.82f, 0.42f, 0.28f, noteColors[currentNoteColor], currentNoteColor, 0, true});
    attachedIndex = static_cast<int>(entities.size()) - 1;
    selected = attachedIndex;
    attachedNote = true;
    LOGI("DSK note-card-spawner-dsk: trigger spawned attached note-card");
  }
  void cycleParticleEffect() {
    particleEffect = (particleEffect + 1) % 4;
    for (RectEntity& entity : entities) if (entity.type == PARTICLE_FUNNEL_SPAWNER) entity.effectIndex = particleEffect;
    LOGI("DSK particle-funnel-spawner-dsk: trigger cycles effect=%d", particleEffect);
  }
  void enterMeadow() {
    immersiveMeadow = true;
    LOGI("DSK portal-transition-dsk: portal.enter meadow-scene-recipe-dsk");
  }
  void emitParticles() {
    for (int i = static_cast<int>(entities.size()) - 1; i >= 0; --i) {
      if (entities[(size_t)i].type == PARTICLE) {
        entities[(size_t)i].z += 0.020f;
        entities[(size_t)i].y += 0.006f;
        if (entities[(size_t)i].z > -1.0f) entities.erase(entities.begin() + i);
      }
    }
    if (frame % 5 != 0) return;
    for (const RectEntity& entity : entities) {
      if (entity.type == PARTICLE_FUNNEL_SPAWNER) {
        float spread = static_cast<float>((frame % 90) / 90.0f) - 0.5f;
        Color color = particleColor(entity.effectIndex);
        entities.push_back({"particle", "particle-funnel-spawner-dsk", PARTICLE, entity.x + spread * 0.18f, entity.y - 0.18f, -2.02f, 0.045f, 0.045f, color, 0, entity.effectIndex, false});
      }
    }
  }
  Color particleColor(int mode) const {
    if (mode == 1) return {1.0f, 0.38f, 0.10f, 0.68f};
    if (mode == 2) return {0.92f, 0.90f, 0.25f, 0.68f};
    if (mode == 3) return {0.90f, 0.25f, 1.0f, 0.68f};
    return {0.38f, 0.84f, 1.0f, 0.58f};
  }
};

class SpatialAuthoringHost {
public:
  explicit SpatialAuthoringHost(android_app* app) : app(app) {}

  void run() {
    app->userData = this;
    app->onAppCmd = [](android_app* a, int32_t cmd) {
      if (cmd == APP_CMD_DESTROY) static_cast<SpatialAuthoringHost*>(a->userData)->exit = true;
    };
    app->onInputEvent = [](android_app* a, AInputEvent* event) -> int32_t {
      return static_cast<SpatialAuthoringHost*>(a->userData)->onInput(event);
    };
    loadContractAsset();
    state.resetFromDskContract();
    if (!init()) LOGE("OpenXR host init failed");
    while (!exit && !app->destroyRequested) {
      int events = 0;
      android_poll_source* source = nullptr;
      while (ALooper_pollOnce(running ? 0 : 100, nullptr, &events, reinterpret_cast<void**>(&source)) >= 0) {
        if (source) source->process(app, source);
        if (app->destroyRequested) exit = true;
      }
      pollEvents();
      if (running) frame();
    }
    shutdown();
  }

private:
  struct Swapchain {
    XrSwapchain handle{XR_NULL_HANDLE};
    int32_t width{0};
    int32_t height{0};
    std::vector<XrSwapchainImageOpenGLESKHR> images;
  };

  void loadContractAsset() {
    if (!app || !app->activity || !app->activity->assetManager) return;
    AAsset* asset = AAssetManager_open(app->activity->assetManager, "spatial-authoring-runtime-contract.json", AASSET_MODE_BUFFER);
    if (!asset) { LOGE("DSK contract asset missing"); return; }
    const size_t len = static_cast<size_t>(AAsset_getLength(asset));
    contractText.assign(len, '\0');
    AAsset_read(asset, contractText.data(), len);
    AAsset_close(asset);
    LOGI("DSK contract loaded bytes=%zu", len);
    if (contractText.find("note-card-spawner-dsk") != std::string::npos) LOGI("DSK contract contains note-card-spawner-dsk");
    if (contractText.find("particle-funnel-spawner-dsk") != std::string::npos) LOGI("DSK contract contains particle-funnel-spawner-dsk");
    if (contractText.find("meadow-scene-recipe-dsk") != std::string::npos) LOGI("DSK contract contains meadow-scene-recipe-dsk");
  }

  int32_t onInput(AInputEvent* event) {
    const int type = AInputEvent_getType(event);
    if (type == AINPUT_EVENT_TYPE_KEY) {
      const int action = AKeyEvent_getAction(event);
      const int key = AKeyEvent_getKeyCode(event);
      const bool gripKey = key == AKEYCODE_BUTTON_R1 || key == AKEYCODE_BUTTON_THUMBR || key == AKEYCODE_BUTTON_B || key == AKEYCODE_BACK;
      LOGI("ANDROID_KEY action=%d key=%d grip=%d", action, key, gripKey ? 1 : 0);
      if (action == AKEY_EVENT_ACTION_DOWN) {
        if (gripKey && !gripDown) { gripDown = true; state.gripDown(); }
        if (!gripKey && !triggerDown) { triggerDown = true; state.triggerDown(); }
        return 1;
      }
      if (action == AKEY_EVENT_ACTION_UP) {
        if (gripKey) { gripDown = false; state.gripUp(); }
        else { triggerDown = false; state.triggerUp(); }
        return 1;
      }
    }
    if (type == AINPUT_EVENT_TYPE_MOTION) {
      const int buttons = AMotionEvent_getButtonState(event);
      float x = AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_X, 0);
      float y = AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_Y, 0);
      const float hatX = AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_HAT_X, 0);
      const float hatY = AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_HAT_Y, 0);
      if (std::fabs(hatX) > std::fabs(x)) x = hatX;
      if (std::fabs(hatY) > std::fabs(y)) y = hatY;
      state.setAxis(x, y);
      const float rt = std::max(AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_RTRIGGER, 0), std::max(AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_GAS, 0), AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_PRESSURE, 0)));
      const float gripAxis = std::max(AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_LTRIGGER, 0), AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_BRAKE, 0));
      const bool triggerPressed = rt > 0.18f || (buttons & AMOTION_EVENT_BUTTON_PRIMARY) != 0;
      const bool gripPressed = gripAxis > 0.18f || (buttons & AMOTION_EVENT_BUTTON_SECONDARY) != 0 || (buttons & AMOTION_EVENT_BUTTON_BACK) != 0 || (buttons & AMOTION_EVENT_BUTTON_FORWARD) != 0;
      if (triggerPressed && !triggerDown) { triggerDown = true; state.triggerDown(); }
      if (!triggerPressed && triggerDown) { triggerDown = false; state.triggerUp(); }
      if (gripPressed && !gripDown) { gripDown = true; state.gripDown(); }
      if (!gripPressed && gripDown) { gripDown = false; state.gripUp(); }
      return 1;
    }
    return 0;
  }

  bool init() {
    return initLoader() && createInstance() && createActions() && getSystem() && chooseBlendMode() && initEgl() && createProgram() && createSession() && attachActions() && createSpaces() && createSwapchains();
  }

  bool initLoader() {
    PFN_xrInitializeLoaderKHR fn = nullptr;
    xrGetInstanceProcAddr(XR_NULL_HANDLE, "xrInitializeLoaderKHR", reinterpret_cast<PFN_xrVoidFunction*>(&fn));
    if (!fn) return true;
    XrLoaderInitInfoAndroidKHR info{XR_TYPE_LOADER_INIT_INFO_ANDROID_KHR};
    info.applicationVM = app->activity->vm;
    info.applicationContext = app->activity->clazz;
    return ok(fn(reinterpret_cast<XrLoaderInitInfoBaseHeaderKHR*>(&info)), "xrInitializeLoaderKHR");
  }

  bool createInstance() {
    const char* extensions[] = { XR_KHR_ANDROID_CREATE_INSTANCE_EXTENSION_NAME, XR_KHR_OPENGL_ES_ENABLE_EXTENSION_NAME };
    XrInstanceCreateInfoAndroidKHR androidInfo{XR_TYPE_INSTANCE_CREATE_INFO_ANDROID_KHR};
    androidInfo.applicationVM = app->activity->vm;
    androidInfo.applicationActivity = app->activity->clazz;
    XrInstanceCreateInfo info{XR_TYPE_INSTANCE_CREATE_INFO};
    info.next = &androidInfo;
    info.enabledExtensionCount = 2;
    info.enabledExtensionNames = extensions;
    std::strncpy(info.applicationInfo.applicationName, "Spatial Authoring Toolkit", XR_MAX_APPLICATION_NAME_SIZE - 1);
    std::strncpy(info.applicationInfo.engineName, "NexusRealtime", XR_MAX_ENGINE_NAME_SIZE - 1);
    info.applicationInfo.apiVersion = XR_CURRENT_API_VERSION;
    return ok(xrCreateInstance(&info, &instance), "xrCreateInstance");
  }

  void suggestBinding(const char* profileName, const char* triggerPath, const char* gripPath, const char* aimPath) {
    XrPath profile{XR_NULL_PATH};
    XrPath trigger{XR_NULL_PATH};
    XrPath grip{XR_NULL_PATH};
    XrPath aim{XR_NULL_PATH};
    if (XR_FAILED(xrStringToPath(instance, profileName, &profile))) return;
    xrStringToPath(instance, triggerPath, &trigger);
    xrStringToPath(instance, gripPath, &grip);
    xrStringToPath(instance, aimPath, &aim);
    XrActionSuggestedBinding bindings[3] = {{triggerAction, trigger}, {gripAction, grip}, {aimAction, aim}};
    XrInteractionProfileSuggestedBinding suggested{XR_TYPE_INTERACTION_PROFILE_SUGGESTED_BINDING};
    suggested.interactionProfile = profile;
    suggested.countSuggestedBindings = 3;
    suggested.suggestedBindings = bindings;
    LOGI("suggestBinding profile=%s result=%d", profileName, xrSuggestInteractionProfileBindings(instance, &suggested));
  }

  bool createActions() {
    XrActionSetCreateInfo setInfo{XR_TYPE_ACTION_SET_CREATE_INFO};
    std::strncpy(setInfo.actionSetName, "spatial_authoring", XR_MAX_ACTION_SET_NAME_SIZE - 1);
    std::strncpy(setInfo.localizedActionSetName, "Spatial Authoring", XR_MAX_LOCALIZED_ACTION_SET_NAME_SIZE - 1);
    if (!ok(xrCreateActionSet(instance, &setInfo, &actionSet), "xrCreateActionSet")) return false;
    xrStringToPath(instance, "/user/hand/right", &rightHandPath);
    XrActionCreateInfo actionInfo{XR_TYPE_ACTION_CREATE_INFO};
    actionInfo.countSubactionPaths = 1;
    actionInfo.subactionPaths = &rightHandPath;
    actionInfo.actionType = XR_ACTION_TYPE_BOOLEAN_INPUT;
    std::strncpy(actionInfo.actionName, "trigger_activate", XR_MAX_ACTION_NAME_SIZE - 1);
    std::strncpy(actionInfo.localizedActionName, "Trigger Activate", XR_MAX_LOCALIZED_ACTION_NAME_SIZE - 1);
    xrCreateAction(actionSet, &actionInfo, &triggerAction);
    std::strncpy(actionInfo.actionName, "grip_grab", XR_MAX_ACTION_NAME_SIZE - 1);
    std::strncpy(actionInfo.localizedActionName, "Grip Grab", XR_MAX_LOCALIZED_ACTION_NAME_SIZE - 1);
    xrCreateAction(actionSet, &actionInfo, &gripAction);
    actionInfo.actionType = XR_ACTION_TYPE_POSE_INPUT;
    std::strncpy(actionInfo.actionName, "right_aim", XR_MAX_ACTION_NAME_SIZE - 1);
    std::strncpy(actionInfo.localizedActionName, "Right Aim", XR_MAX_LOCALIZED_ACTION_NAME_SIZE - 1);
    xrCreateAction(actionSet, &actionInfo, &aimAction);
    suggestBinding("/interaction_profiles/khr/simple_controller", "/user/hand/right/input/select/click", "/user/hand/right/input/menu/click", "/user/hand/right/input/aim/pose");
    suggestBinding("/interaction_profiles/bytedance/pico4_controller", "/user/hand/right/input/trigger/click", "/user/hand/right/input/squeeze/click", "/user/hand/right/input/aim/pose");
    suggestBinding("/interaction_profiles/bytedance/pico_neo3_controller", "/user/hand/right/input/trigger/click", "/user/hand/right/input/squeeze/click", "/user/hand/right/input/aim/pose");
    return true;
  }

  bool getSystem() { XrSystemGetInfo info{XR_TYPE_SYSTEM_GET_INFO}; info.formFactor = XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY; return ok(xrGetSystem(instance, &info, &systemId), "xrGetSystem"); }
  bool chooseBlendMode() {
    uint32_t count = 0;
    xrEnumerateEnvironmentBlendModes(instance, systemId, XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO, 0, &count, nullptr);
    std::vector<XrEnvironmentBlendMode> modes(count);
    if (count) xrEnumerateEnvironmentBlendModes(instance, systemId, XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO, count, &count, modes.data());
    for (auto mode : modes) if (mode == XR_ENVIRONMENT_BLEND_MODE_ALPHA_BLEND) { blendMode = XR_ENVIRONMENT_BLEND_MODE_ALPHA_BLEND; LOGI("MR alpha blend available"); return true; }
    blendMode = modes.empty() ? XR_ENVIRONMENT_BLEND_MODE_OPAQUE : modes[0];
    LOGI("MR alpha unavailable; mode=%d", blendMode);
    return true;
  }
  bool initEgl() {
    display = eglGetDisplay(EGL_DEFAULT_DISPLAY);
    if (display == EGL_NO_DISPLAY || !eglInitialize(display, nullptr, nullptr)) return false;
    const EGLint attrs[] = { EGL_RENDERABLE_TYPE, EGL_OPENGL_ES3_BIT, EGL_SURFACE_TYPE, EGL_PBUFFER_BIT, EGL_RED_SIZE, 8, EGL_GREEN_SIZE, 8, EGL_BLUE_SIZE, 8, EGL_ALPHA_SIZE, 8, EGL_DEPTH_SIZE, 16, EGL_NONE };
    EGLint num = 0;
    if (!eglChooseConfig(display, attrs, &config, 1, &num) || num < 1) return false;
    const EGLint ctxAttrs[] = { EGL_CONTEXT_CLIENT_VERSION, 3, EGL_NONE };
    context = eglCreateContext(display, config, EGL_NO_CONTEXT, ctxAttrs);
    const EGLint surfAttrs[] = { EGL_WIDTH, 16, EGL_HEIGHT, 16, EGL_NONE };
    surface = eglCreatePbufferSurface(display, config, surfAttrs);
    return context != EGL_NO_CONTEXT && surface != EGL_NO_SURFACE && eglMakeCurrent(display, surface, surface, context);
  }
  GLuint shader(GLenum type, const char* src) { GLuint id = glCreateShader(type); glShaderSource(id, 1, &src, nullptr); glCompileShader(id); return id; }
  bool createProgram() {
    const char* vs = "#version 300 es\nlayout(location=0)in vec3 p;uniform mat4 mvp;void main(){gl_Position=mvp*vec4(p,1.0);}";
    const char* fs = "#version 300 es\nprecision mediump float;uniform vec4 col;out vec4 o;void main(){o=col;}";
    GLuint v = shader(GL_VERTEX_SHADER, vs);
    GLuint f = shader(GL_FRAGMENT_SHADER, fs);
    program = glCreateProgram(); glAttachShader(program, v); glAttachShader(program, f); glLinkProgram(program); glDeleteShader(v); glDeleteShader(f);
    float quad[] = {-0.5f,-0.5f,0, 0.5f,-0.5f,0, 0.5f,0.5f,0, -0.5f,-0.5f,0, 0.5f,0.5f,0, -0.5f,0.5f,0};
    glGenBuffers(1, &vbo); glBindBuffer(GL_ARRAY_BUFFER, vbo); glBufferData(GL_ARRAY_BUFFER, sizeof(quad), quad, GL_STATIC_DRAW);
    return true;
  }
  bool createSession() {
    PFN_xrGetOpenGLESGraphicsRequirementsKHR req = nullptr; xrGetInstanceProcAddr(instance, "xrGetOpenGLESGraphicsRequirementsKHR", reinterpret_cast<PFN_xrVoidFunction*>(&req)); if (!req) return false;
    XrGraphicsRequirementsOpenGLESKHR gr{XR_TYPE_GRAPHICS_REQUIREMENTS_OPENGL_ES_KHR}; req(instance, systemId, &gr);
    XrGraphicsBindingOpenGLESAndroidKHR binding{XR_TYPE_GRAPHICS_BINDING_OPENGL_ES_ANDROID_KHR}; binding.display = display; binding.config = config; binding.context = context;
    XrSessionCreateInfo info{XR_TYPE_SESSION_CREATE_INFO}; info.next = &binding; info.systemId = systemId; return ok(xrCreateSession(instance, &info, &session), "xrCreateSession");
  }
  bool attachActions() { XrSessionActionSetsAttachInfo info{XR_TYPE_SESSION_ACTION_SETS_ATTACH_INFO}; info.countActionSets = 1; info.actionSets = &actionSet; return ok(xrAttachSessionActionSets(session, &info), "xrAttachSessionActionSets"); }
  bool createSpaces() { XrReferenceSpaceCreateInfo ref{XR_TYPE_REFERENCE_SPACE_CREATE_INFO}; ref.referenceSpaceType = XR_REFERENCE_SPACE_TYPE_LOCAL; ref.poseInReferenceSpace = identityPose(); if (!ok(xrCreateReferenceSpace(session, &ref, &space), "xrCreateReferenceSpace")) return false; XrActionSpaceCreateInfo aim{XR_TYPE_ACTION_SPACE_CREATE_INFO}; aim.action = aimAction; aim.subactionPath = rightHandPath; aim.poseInActionSpace = identityPose(); xrCreateActionSpace(session, &aim, &aimSpace); return true; }
  int64_t chooseFormat() { uint32_t count = 0; xrEnumerateSwapchainFormats(session, 0, &count, nullptr); std::vector<int64_t> formats(count); if (count) xrEnumerateSwapchainFormats(session, count, &count, formats.data()); return formats.empty() ? GL_RGBA8 : formats[0]; }
  bool createSwapchains() {
    uint32_t count = 0; xrEnumerateViewConfigurationViews(instance, systemId, XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO, 0, &count, nullptr);
    configViews.resize(count, {XR_TYPE_VIEW_CONFIGURATION_VIEW}); xrEnumerateViewConfigurationViews(instance, systemId, XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO, count, &count, configViews.data());
    views.resize(count, {XR_TYPE_VIEW}); swapchains.resize(count); projectionViews.resize(count, {XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW});
    for (uint32_t i = 0; i < count; ++i) { XrSwapchainCreateInfo info{XR_TYPE_SWAPCHAIN_CREATE_INFO}; info.usageFlags = XR_SWAPCHAIN_USAGE_COLOR_ATTACHMENT_BIT; info.format = chooseFormat(); info.sampleCount = configViews[i].recommendedSwapchainSampleCount; info.width = configViews[i].recommendedImageRectWidth; info.height = configViews[i].recommendedImageRectHeight; info.faceCount = 1; info.arraySize = 1; info.mipCount = 1; if (!ok(xrCreateSwapchain(session, &info, &swapchains[i].handle), "xrCreateSwapchain")) return false; swapchains[i].width = info.width; swapchains[i].height = info.height; uint32_t ic = 0; xrEnumerateSwapchainImages(swapchains[i].handle, 0, &ic, nullptr); swapchains[i].images.resize(ic, {XR_TYPE_SWAPCHAIN_IMAGE_OPENGL_ES_KHR}); xrEnumerateSwapchainImages(swapchains[i].handle, ic, &ic, reinterpret_cast<XrSwapchainImageBaseHeader*>(swapchains[i].images.data())); }
    return true;
  }

  void pollEvents() { XrEventDataBuffer e{XR_TYPE_EVENT_DATA_BUFFER}; while (instance && xrPollEvent(instance, &e) == XR_SUCCESS) { if (e.type == XR_TYPE_EVENT_DATA_SESSION_STATE_CHANGED) { auto* s = reinterpret_cast<XrEventDataSessionStateChanged*>(&e); if (s->state == XR_SESSION_STATE_READY) { XrSessionBeginInfo bi{XR_TYPE_SESSION_BEGIN_INFO}; bi.primaryViewConfigurationType = XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO; if (ok(xrBeginSession(session, &bi), "xrBeginSession")) running = true; } else if (s->state == XR_SESSION_STATE_STOPPING) { xrEndSession(session); running = false; } else if (s->state == XR_SESSION_STATE_EXITING || s->state == XR_SESSION_STATE_LOSS_PENDING) exit = true; } e = {XR_TYPE_EVENT_DATA_BUFFER}; } }

  bool pointerFromPose(const XrPosef& pose, float& x, float& y) { Vec3 origin{pose.position.x, pose.position.y, pose.position.z}; Vec3 dir = rotateVector(pose.orientation, {0,0,-1}); const float z = -2.0f; if (std::fabs(dir.z) < 0.001f) return false; const float t = (z - origin.z) / dir.z; if (t < 0.05f || t > 8.0f) return false; x = clampf(origin.x + dir.x * t, -1.4f, 1.4f); y = clampf(origin.y + dir.y * t, 0.45f, 1.95f); return true; }

  void syncInput(XrTime time, const XrPosef& headPose) {
    XrActiveActionSet active{actionSet, XR_NULL_PATH}; XrActionsSyncInfo sync{XR_TYPE_ACTIONS_SYNC_INFO}; sync.countActiveActionSets = 1; sync.activeActionSets = &active; xrSyncActions(session, &sync);
    XrActionStateGetInfo get{XR_TYPE_ACTION_STATE_GET_INFO}; get.subactionPath = rightHandPath; XrActionStateBoolean stateBool{XR_TYPE_ACTION_STATE_BOOLEAN};
    get.action = triggerAction; if (XR_SUCCEEDED(xrGetActionStateBoolean(session, &get, &stateBool)) && stateBool.isActive) { if (stateBool.currentState && !triggerDown) { triggerDown = true; state.triggerDown(); } if (!stateBool.currentState && triggerDown) { triggerDown = false; state.triggerUp(); } }
    stateBool = {XR_TYPE_ACTION_STATE_BOOLEAN}; get.action = gripAction; if (XR_SUCCEEDED(xrGetActionStateBoolean(session, &get, &stateBool)) && stateBool.isActive) { if (stateBool.currentState && !gripDown) { gripDown = true; state.gripDown(); } if (!stateBool.currentState && gripDown) { gripDown = false; state.gripUp(); } }
    XrSpaceLocation loc{XR_TYPE_SPACE_LOCATION}; if (aimSpace && XR_SUCCEEDED(xrLocateSpace(aimSpace, space, time, &loc)) && (loc.locationFlags & XR_SPACE_LOCATION_ORIENTATION_VALID_BIT)) { float x, y; if (pointerFromPose(loc.pose, x, y)) { state.setPointer(x, y); return; } }
    float x, y; if (pointerFromPose(headPose, x, y)) state.setPointer(x, y);
  }

  void frame() {
    state.tick(); XrFrameState fs{XR_TYPE_FRAME_STATE}; XrFrameWaitInfo wi{XR_TYPE_FRAME_WAIT_INFO}; if (!ok(xrWaitFrame(session, &wi, &fs), "xrWaitFrame")) return; XrFrameBeginInfo bi{XR_TYPE_FRAME_BEGIN_INFO}; xrBeginFrame(session, &bi);
    std::vector<XrCompositionLayerBaseHeader*> layers; XrCompositionLayerProjection layer{XR_TYPE_COMPOSITION_LAYER_PROJECTION};
    if (fs.shouldRender) { XrViewLocateInfo li{XR_TYPE_VIEW_LOCATE_INFO}; li.viewConfigurationType = XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO; li.displayTime = fs.predictedDisplayTime; li.space = space; XrViewState viewState{XR_TYPE_VIEW_STATE}; uint32_t vc = 0; xrLocateViews(session, &li, &viewState, static_cast<uint32_t>(views.size()), &vc, views.data()); if (vc) syncInput(fs.predictedDisplayTime, views[0].pose); for (uint32_t i = 0; i < vc; ++i) renderView(i, views[i]); layer.space = space; layer.viewCount = vc; layer.views = projectionViews.data(); layers.push_back(reinterpret_cast<XrCompositionLayerBaseHeader*>(&layer)); }
    XrFrameEndInfo ei{XR_TYPE_FRAME_END_INFO}; ei.displayTime = fs.predictedDisplayTime; ei.environmentBlendMode = state.immersiveMeadow ? XR_ENVIRONMENT_BLEND_MODE_OPAQUE : blendMode; ei.layerCount = static_cast<uint32_t>(layers.size()); ei.layers = layers.empty() ? nullptr : layers.data(); xrEndFrame(session, &ei);
  }

  void drawRect(const RectEntity& e, const Mat4& vp, bool selected) { Mat4 mvp = mul(vp, mul(translate(e.x, e.y, e.z), scale(e.w, e.h, 1))); Color c = selected ? Color{1,1,0.12f,0.95f} : e.color; glUniformMatrix4fv(glGetUniformLocation(program, "mvp"), 1, GL_FALSE, mvp.m); glUniform4f(glGetUniformLocation(program, "col"), c.r, c.g, c.b, c.a); glDrawArrays(GL_TRIANGLES, 0, 6); }
  void drawScene(const XrView& view) {
    Mat4 vp = mul(projection(view.fov), viewFromPose(view.pose)); glUseProgram(program); glBindBuffer(GL_ARRAY_BUFFER, vbo); glEnableVertexAttribArray(0); glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 12, reinterpret_cast<void*>(0)); glEnable(GL_BLEND); glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    if (state.immersiveMeadow) { for (int i = -6; i <= 6; ++i) drawRect({"grass", "meadow-scene-recipe-dsk", MEADOW_PROP, i * 0.45f + state.navX, 0.35f, -2.6f - state.navZ, 0.055f, 0.55f, {0.20f,0.85f,0.24f,0.95f},0,0,false}, vp, false); drawRect({"ground", "meadow-scene-recipe-dsk", MEADOW_PROP, state.navX, 0.08f, -3.2f - state.navZ, 5.0f, 1.3f, {0.16f,0.55f,0.22f,1.0f},0,0,false}, vp, false); }
    for (size_t i = 0; i < state.entities.size(); ++i) if (!state.immersiveMeadow || state.entities[i].type == MEADOW_PORTAL) drawRect(state.entities[i], vp, static_cast<int>(i) == state.selected || state.entities[i].type == MEADOW_PORTAL);
    drawRect({"pointer", "interaction-dsk", NOTE_CARD, state.pointerX, state.pointerY, -1.86f, 0.11f, 0.11f, state.gripHeld || state.attachedNote ? Color{1,0.9f,0.1f,1} : Color{0.2f,0.8f,1,1},0,0,false}, vp, true);
  }
  void renderView(uint32_t i, const XrView& view) { Swapchain& sw = swapchains[i]; uint32_t img = 0; XrSwapchainImageAcquireInfo ai{XR_TYPE_SWAPCHAIN_IMAGE_ACQUIRE_INFO}; xrAcquireSwapchainImage(sw.handle, &ai, &img); XrSwapchainImageWaitInfo wait{XR_TYPE_SWAPCHAIN_IMAGE_WAIT_INFO}; wait.timeout = XR_INFINITE_DURATION; xrWaitSwapchainImage(sw.handle, &wait); GLuint fbo; glGenFramebuffers(1, &fbo); glBindFramebuffer(GL_FRAMEBUFFER, fbo); glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, sw.images[img].image, 0); glViewport(0,0,sw.width,sw.height); glClearColor(state.immersiveMeadow ? 0.35f : 0.0f, state.immersiveMeadow ? 0.60f : 0.0f, state.immersiveMeadow ? 0.95f : 0.0f, state.immersiveMeadow ? 1.0f : (blendMode == XR_ENVIRONMENT_BLEND_MODE_ALPHA_BLEND ? 0.0f : 1.0f)); glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT); glEnable(GL_DEPTH_TEST); drawScene(view); glBindFramebuffer(GL_FRAMEBUFFER, 0); glDeleteFramebuffers(1, &fbo); projectionViews[i] = {XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW}; projectionViews[i].pose = view.pose; projectionViews[i].fov = view.fov; projectionViews[i].subImage.swapchain = sw.handle; projectionViews[i].subImage.imageRect.offset = {0,0}; projectionViews[i].subImage.imageRect.extent = {sw.width, sw.height}; XrSwapchainImageReleaseInfo ri{XR_TYPE_SWAPCHAIN_IMAGE_RELEASE_INFO}; xrReleaseSwapchainImage(sw.handle, &ri); }
  void shutdown() { if (aimSpace) xrDestroySpace(aimSpace); if (triggerAction) xrDestroyAction(triggerAction); if (gripAction) xrDestroyAction(gripAction); if (aimAction) xrDestroyAction(aimAction); if (actionSet) xrDestroyActionSet(actionSet); for (auto& sw : swapchains) if (sw.handle) xrDestroySwapchain(sw.handle); if (space) xrDestroySpace(space); if (session) xrDestroySession(session); if (instance) xrDestroyInstance(instance); if (program) glDeleteProgram(program); if (vbo) glDeleteBuffers(1, &vbo); if (display != EGL_NO_DISPLAY) { eglMakeCurrent(display, EGL_NO_SURFACE, EGL_NO_SURFACE, EGL_NO_CONTEXT); if (surface != EGL_NO_SURFACE) eglDestroySurface(display, surface); if (context != EGL_NO_CONTEXT) eglDestroyContext(display, context); eglTerminate(display); } }

  android_app* app = nullptr; ToolkitState state; std::string contractText; bool exit = false; bool running = false; bool triggerDown = false; bool gripDown = false; XrEnvironmentBlendMode blendMode = XR_ENVIRONMENT_BLEND_MODE_OPAQUE; XrInstance instance{XR_NULL_HANDLE}; XrSystemId systemId{XR_NULL_SYSTEM_ID}; XrSession session{XR_NULL_HANDLE}; XrSpace space{XR_NULL_HANDLE}; XrActionSet actionSet{XR_NULL_HANDLE}; XrAction triggerAction{XR_NULL_HANDLE}; XrAction gripAction{XR_NULL_HANDLE}; XrAction aimAction{XR_NULL_HANDLE}; XrPath rightHandPath{XR_NULL_PATH}; XrSpace aimSpace{XR_NULL_HANDLE}; EGLDisplay display{EGL_NO_DISPLAY}; EGLConfig config{}; EGLContext context{EGL_NO_CONTEXT}; EGLSurface surface{EGL_NO_SURFACE}; GLuint program = 0; GLuint vbo = 0; std::vector<XrViewConfigurationView> configViews; std::vector<XrView> views; std::vector<Swapchain> swapchains; std::vector<XrCompositionLayerProjectionView> projectionViews;
};

void android_main(android_app* app) { app_dummy(); SpatialAuthoringHost host(app); host.run(); }
