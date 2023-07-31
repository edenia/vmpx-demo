cmake_minimum_required(VERSION 3.27)
project(token)
include(ExternalProject)

# if no cdt root is given use default path
if(EOSIO_CDT_ROOT STREQUAL "" OR NOT EOSIO_CDT_ROOT)
   find_package(blanc)
endif()

ExternalProject_Add(
   token_project
   SOURCE_DIR ${CMAKE_SOURCE_DIR}/eosio.token/src
   BINARY_DIR ${CMAKE_BINARY_DIR}/eosio.token
   CMAKE_ARGS -DCMAKE_TOOLCHAIN_FILE=${EOSIO_CDT_ROOT}/lib/cmake/blanc/EosioWasmToolchain.cmake
   UPDATE_COMMAND ""
   PATCH_COMMAND ""
   TEST_COMMAND ""
   INSTALL_COMMAND ""
   BUILD_ALWAYS 1
)
