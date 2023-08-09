project(swap)

set(EOSIO_WASM_OLD_BEHAVIOR "Off")
find_package(cdt)

add_contract( swap.libre swap.libre libreswap.cpp token_functions.cpp )
target_include_directories( swap.libre PUBLIC ${CMAKE_SOURCE_DIR}/../include )
target_ricardian_directory( swap.libre ${CMAKE_SOURCE_DIR}/../ricardian )