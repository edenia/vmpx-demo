
deploy_token_contracts() {
    echo "Deploying token contracts..."

    echo "1. Deploying EVMPX contract"
    cleos.sh set contract evmpx ./eosio.token eosio.token.wasm eosio.token.abi -p evmpx@active

    echo "2. Deploying BVMPX contract"
    cleos.sh set contract bvmpx ./eosio.token eosio.token.wasm eosio.token.abi -p bvmpx@active
}

deploy_token_linker_contract() {
    echo "Deploying token linker contract..."

    echo "1. Deploying TokenLinker contract"
    cleos.sh set contract tokenlinker ./vmpxex vmpxex.wasm vmpxex.abi -p tokenlinker@active
}

deploy_swap_contract() {
    echo "Deploying swap contract..."

    echo "1. Deploying Swap contract"
    cleos.sh set contract swaptest ./swap.libre swap.libre.wasm swap.libre.abi -p swaptest@active

    echo "2. Deploying SFee contract"
    cleos.sh set contract sfeetest ./sfee.libre sfee.libre.wasm sfee.libre.abi -p sfeetest@active
}

deploy_token_contracts
deploy_token_linker_contract
deploy_swap_contract