cmake_minimum_required(VERSION 3.22.1)
project(spatial_authoring_openxr LANGUAGES C CXX)

include(FetchContent)
set(BUILD_API_LAYERS OFF CACHE BOOL "" FORCE)
set(BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(BUILD_CONFORMANCE_TESTS OFF CACHE BOOL "" FORCE)
set(BUILD_WITH_SYSTEM_JSONCPP OFF CACHE BOOL "" FORCE)
set(DYNAMIC_LOADER OFF CACHE BOOL "" FORCE)

FetchContent_Declare(
  OpenXRSDK
  GIT_REPOSITORY https://github.com/KhronosGroup/OpenXR-SDK-Source.git
  GIT_TAG main
)
FetchContent_MakeAvailable(OpenXRSDK)

set(NATIVE_APP_GLUE ${ANDROID_NDK}/sources/android/native_app_glue/android_native_app_glue.c)

add_library(spatial_authoring_openxr SHARED
  endless_platformer_openxr.cpp
  ${NATIVE_APP_GLUE}
)

target_compile_features(spatial_authoring_openxr PRIVATE cxx_std_17)

target_compile_definitions(spatial_authoring_openxr PRIVATE
  XR_USE_PLATFORM_ANDROID
  XR_USE_GRAPHICS_API_OPENGL_ES
)

target_include_directories(spatial_authoring_openxr PRIVATE
  ${ANDROID_NDK}/sources/android/native_app_glue
)

target_link_libraries(spatial_authoring_openxr PRIVATE
  openxr_loader
  android
  log
  EGL
  GLESv3
)
