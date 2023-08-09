project(swapfee)

set(EOSIO_WASM_OLD_BEHAVIOR "Off")
find_package(cdt)

add_contract( sfee.libre sfee.libre swapfee.cpp )
target_include_directories( sfee.libre PUBLIC ${CMAKE_SOURCE_DIR}/../include )
target_ricardian_directory( sfee.libre ${CMAKE_SOURCE_DIR}/../ricardian )