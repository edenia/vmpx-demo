cmake_minimum_required(VERSION 3.27)
project(vmpxex)

# if no cdt root is given use default path
if(EOSIO_CDT_ROOT STREQUAL "" OR NOT EOSIO_CDT_ROOT)
   find_package(blanc)
endif()

add_subdirectory(vmpxex)
add_subdirectory(eosio.token)