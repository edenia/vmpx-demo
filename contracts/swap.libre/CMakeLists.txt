cmake_minimum_required(VERSION 3.27)
project(swap)
include(ExternalProject)

# if no cdt root is given use default path
if(EOSIO_CDT_ROOT STREQUAL "" OR NOT EOSIO_CDT_ROOT)
   find_package(blanc)
endif()

ExternalProject_Add(
   swap_project
   SOURCE_DIR ${CMAKE_SOURCE_DIR}/swap.libre/src
   BINARY_DIR ${CMAKE_BINARY_DIR}/swap.libre
   CMAKE_ARGS -DCMAKE_TOOLCHAIN_FILE=${EOSIO_CDT_ROOT}/lib/cmake/blanc/EosioWasmToolchain.cmake
   UPDATE_COMMAND ""
   PATCH_COMMAND ""
   TEST_COMMAND ""
   INSTALL_COMMAND ""
   BUILD_ALWAYS 1
)
