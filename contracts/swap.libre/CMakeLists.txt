cmake_minimum_required(VERSION 3.27)
project(swap)
include(ExternalProject)

# if no cdt root is given use default path
if(CDT_ROOT STREQUAL "" OR NOT CDT_ROOT)
   find_package(cdt)
endif()

ExternalProject_Add(
   swap_project
   SOURCE_DIR ${CMAKE_SOURCE_DIR}/swap.libre/src
   BINARY_DIR ${CMAKE_BINARY_DIR}/swap.libre
   CMAKE_ARGS
      -DCMAKE_TOOLCHAIN_FILE=${CDT_ROOT}/lib/cmake/cdt/CDTWasmToolchain.cmake
      -DVMPX_SFEE_ACCOUNT:STRING=${VMPX_SFEE_ACCOUNT}
   UPDATE_COMMAND ""
   PATCH_COMMAND ""
   TEST_COMMAND ""
   INSTALL_COMMAND ""
   BUILD_ALWAYS 1
)
