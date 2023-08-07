cmake_minimum_required(VERSION 3.27)
project(vmpxex)

# if no cdt root is given use default path
if(CDT_ROOT STREQUAL "" OR NOT CDT_ROOT)
   find_package(cdt)
endif()

add_subdirectory(vmpxex)
add_subdirectory(eosio.token)
add_subdirectory(swap.libre)