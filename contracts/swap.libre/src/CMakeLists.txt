project(swap)

set(EOSIO_WASM_OLD_BEHAVIOR "Off")
find_package(blanc)

add_contract( swap swap libreswap.cpp token_functions.cpp )
target_include_directories( swap PUBLIC ${CMAKE_SOURCE_DIR}/../include )
target_ricardian_directory( swap ${CMAKE_SOURCE_DIR}/../ricardian )