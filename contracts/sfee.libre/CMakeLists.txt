cmake_minimum_required(VERSION 3.27)
project(swapfee)
include(ExternalProject)

# if no cdt root is given use default path
if(CDT_ROOT STREQUAL "" OR NOT CDT_ROOT)
   find_package(cdt)
endif()

ExternalProject_Add(
   swapfee_project
   SOURCE_DIR ${CMAKE_SOURCE_DIR}/sfee.libre/src
   BINARY_DIR ${CMAKE_BINARY_DIR}/sfee.libre
   CMAKE_ARGS
      -DCMAKE_TOOLCHAIN_FILE=${CDT_ROOT}/lib/cmake/cdt/CDTWasmToolchain.cmake
      -DVMPX_SWAP_ACCOUNT:STRING=${VMPX_SWAP_ACCOUNT}
   UPDATE_COMMAND ""
   PATCH_COMMAND ""
   TEST_COMMAND ""
   INSTALL_COMMAND ""
   BUILD_ALWAYS 1
)
