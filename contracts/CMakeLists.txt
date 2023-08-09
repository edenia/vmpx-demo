cmake_minimum_required(VERSION 3.27)
project(vmpxex)

# if no cdt root is given use default path
if(CDT_ROOT STREQUAL "" OR NOT CDT_ROOT)
   find_package(cdt)
endif()

set(VMPX_EVMPX_ACCOUNT evmpx CACHE STRING "The account holding the token vmpx contract")
set(VMPX_BVMPX_ACCOUNT bvmpx CACHE STRING "The account holding the token vmpx contract")
set(VMPX_SWAP_ACCOUNT swapvmpx CACHE STRING "The account holding the vmpx swap contract")
set(VMPX_SFEE_ACCOUNT sfeevmpx CACHE STRING "The account holding the vmpx sfee contract")

add_subdirectory(vmpxex)
add_subdirectory(eosio.token)
add_subdirectory(swap.libre)
add_subdirectory(sfee.libre)