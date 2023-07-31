project(vmpxex)

set(EOSIO_WASM_OLD_BEHAVIOR "Off")
find_package(blanc)

add_contract( vmpxex vmpxex vmpxex.cpp )
target_include_directories( vmpxex PUBLIC ${CMAKE_SOURCE_DIR}/../include )
target_ricardian_directory( vmpxex ${CMAKE_SOURCE_DIR}/../ricardian )