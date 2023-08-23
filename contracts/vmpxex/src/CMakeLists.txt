project(vmpxex)

set(EOSIO_WASM_OLD_BEHAVIOR "Off")
find_package(cdt)

configure_file(../include/_config.hpp.in ${CMAKE_BINARY_DIR}/generated/config.hpp)
include_directories(${CMAKE_BINARY_DIR}/generated/)

add_contract( vmpxex vmpxex vmpxex.cpp )
target_include_directories( vmpxex PUBLIC ${CMAKE_SOURCE_DIR}/../include ${CMAKE_SOURCE_DIR}/../common )
target_ricardian_directory( vmpxex ${CMAKE_SOURCE_DIR}/../ricardian )