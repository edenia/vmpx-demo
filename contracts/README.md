# VMPX Demo Contract

## Set required permission

```sh
setup_token_contract() {
    # create tokens
    cleos.sh -u tlibre push action vmpx create '["vmpx", "108624000.000000000 VMPX"]' -p vmpx       # eVMPX
    cleos.sh -u tlibre push action bvmpx create '["bvmpx", "108624000.000000000 BVMPX"]' -p bvmpx   # bVMPX
}

issue_and_transfer_tokens() {
    # issue tokens
    cleos.sh -u tlibre push action vmpx issue '["vmpx", "500.000000000 VMPX", "issue tokens for testing"]' -p vmpx

    cleos.sh -u tlibre push action bvmpx issue '["bvmpx", "500.000000000 BVMPX", "issue tokens for testing"]' -p bvmpx

    # transfer tokens
    cleos.sh -u tlibre push action vmpx transfer '["vmpx", "alice", "250.000000000 VMPX", "transfer 250 VMPX to alice"]' -p vmpx
    cleos.sh -u tlibre push action vmpx transfer '["vmpx", "bob", "250.000000000  VMPX", "transfer 250 VMPX to bob"]' -p vmpx

    cleos.sh -u tlibre push action bvmpx transfer '["bvmpx", "alice", "250.000000000 BVMPX", "transfer 250 BVMPX to alice"]' -p bvmpx
    cleos.sh -u tlibre push action bvmpx transfer '["bvmpx", "bob", "250.000000000 BVMPX", "transfer 250 BVMPX to bob"]' -p bvmpx
}

setup_swap_contract() {
    CLEOS="cleos.sh"
    YOUR_ACCOUNT_ALICE="alice"
    YOUR_ACCOUNT_BOB="bob"
    SWAPCONTRACT="swaptest"
    FEECONTRACT="sfeetest"
    B_SYMBOL="BVMPX"
    B_CONTRACT="bvmpx"
    B_PRECISION="9"
    B_AMT="100.000000000 BVMPX"
    E_SYMBOL="VMPX"
    E_CONTRACT="vmpx"
    E_PRECISION="9"
    E_AMT="100.000000000 VMPX"
    BE_SYMBOL="BEVMPX"
    BE_PRECISION="9"

    # set eosio.code permission for tokenlinker
    cleos.sh -u tlibre set account permission --add-code $SWAPCONTRACT active -p $SWAPCONTRACT

    # ALICE - Open a channel for VMPX coin
    $CLEOS push action $SWAPCONTRACT openext '["'"$YOUR_ACCOUNT_ALICE"'", "'"$YOUR_ACCOUNT_ALICE"'", {"contract":"'"$E_CONTRACT"'", "sym":"'"$E_PRECISION"','"$E_SYMBOL"'"}]' -p $YOUR_ACCOUNT_ALICE

    # ALICE - Open a channel for BVMPX coin
    $CLEOS push action $SWAPCONTRACT openext '["'"$YOUR_ACCOUNT_ALICE"'", "'"$YOUR_ACCOUNT_ALICE"'", {"contract":"'"$B_CONTRACT"'", "sym":"'"$B_PRECISION"','"$B_SYMBOL"'"}]' -p $YOUR_ACCOUNT_ALICE

    # BOB - Open a channel for VMPX coin
    $CLEOS push action $SWAPCONTRACT openext '["'"$YOUR_ACCOUNT_BOB"'", "'"$YOUR_ACCOUNT_BOB"'", {"contract":"'"$E_CONTRACT"'", "sym":"'"$E_PRECISION"','"$E_SYMBOL"'"}]' -p $YOUR_ACCOUNT_BOB

    # BOB -Open a channel for BVMPX coin
    $CLEOS push action $SWAPCONTRACT openext '["'"$YOUR_ACCOUNT_BOB"'", "'"$YOUR_ACCOUNT_BOB"'", {"contract":"'"$B_CONTRACT"'", "sym":"'"$B_PRECISION"','"$B_SYMBOL"'"}]' -p $YOUR_ACCOUNT_BOB


    # ALICE - Transfer tokens
    $CLEOS push action $E_CONTRACT transfer '["'"$YOUR_ACCOUNT_ALICE"'", "'"$SWAPCONTRACT"'", "100.000000000 '"$E_SYMBOL"'", "memo"]' -p $YOUR_ACCOUNT_ALICE

    $CLEOS push action $B_CONTRACT transfer '["'"$YOUR_ACCOUNT_ALICE"'", "'"$SWAPCONTRACT"'", "100.000000000 '"$B_SYMBOL"'", "memo"]' -p $YOUR_ACCOUNT_ALICE

    # BOB - Transfer tokens
    $CLEOS push action $E_CONTRACT transfer '["'"$YOUR_ACCOUNT_BOB"'", "'"$SWAPCONTRACT"'", "100.000000000 '"$E_SYMBOL"'", "memo"]' -p $YOUR_ACCOUNT_BOB

    $CLEOS push action $B_CONTRACT transfer '["'"$YOUR_ACCOUNT_BOB"'", "'"$SWAPCONTRACT"'", "100.000000000 '"$B_SYMBOL"'", "memo"]' -p $YOUR_ACCOUNT_BOB

    # (ALICE/BOB) - Initialize token
    $CLEOS push action $SWAPCONTRACT inittoken '["'"$YOUR_ACCOUNT_ALICE"'", "'$BE_PRECISION','"$BE_SYMBOL"'", {"contract":"'"$B_CONTRACT"'", "quantity":"10.000000000 '"$B_SYMBOL"'"}, {"contract":"'"$E_CONTRACT"'", "quantity":"10.000000000 '"$E_SYMBOL"'"}, 10, "'"$FEECONTRACT"'"]' -p $YOUR_ACCOUNT_ALICE -p $SWAPCONTRACT

    # BOB - Add liquidity
    $CLEOS push action $SWAPCONTRACT addliquidity '["'"$YOUR_ACCOUNT_BOB"'", "10.000000000 '$BE_SYMBOL'", "10.000000000 '$B_SYMBOL'", "10.000000000 '$E_SYMBOL'"]' -p $YOUR_ACCOUNT_BOB
}

setup_permission() {
    cleos -u https://testnet.libre.org set account permission vmpx transferer '{"threshold": 1, "keys": [], "accounts":[{"permission":{"actor": "tokenlinker", "permission":"active"}, "weight": 1}], "waits": [] }' active -p vmpx@active

    cleos -u https://testnet.libre.org set action permission vmpx vmpx issue transferer -p vmpx@active
    cleos -u https://testnet.libre.org set action permission vmpx vmpx transfer transferer -p vmpx@active
    cleos -u https://testnet.libre.org set action permission vmpx vmpx burn transferer -p vmpx@active

    # set eosio.code permission for tokenlinker
    cleos -u https://testnet.libre.org set account permission tokenlinker active --add-code -p tokenlinker@active
}
```

## Getting started
