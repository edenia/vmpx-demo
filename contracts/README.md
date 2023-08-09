# EVMPX Demo Contract

## Set required actions and permissions

```sh
create_accounts() {
    # swap contracts
    cleos.sh create account eosio swapvmpx EOS55J1v4pUbPGt6kh8dv4bZ9U2NBjv82KrmEBS1n7kQF9hzZ8LYZ

    cleos.sh create account eosio sfeevmpx EOS6aiUJFbYGPztL73hr8ebCt7Nnt52LcH4hbhj98ui9QJPX4upcs

    # token contracts
    cleos.sh create account eosio evmpx EOS6mueis2odquS6h9N5nfTXLYrRRnGwGjMVQfysadKBo2NzXJqqa

    cleos.sh create account eosio bvmpx EOS74ZUzjQaghdsG8UZGtr5ThVkQf7NoZaudck3uoRnSiNYJ41q9r

    # token linker contracts
    cleos.sh create account eosio tokenlinker EOS5SgDdUh2LwLv44kB7E6sWMuMVDc4mb47MWhKYUNdshzktXonob
}

give_contract_resources() {
    cleos push action eosio setalimits '{"authorizer": "eosio", "account": "swapvmpx", "ram": -1, "net": -1, "cpu": -1}' -p eosio@active
    cleos push action eosio setalimits '{"authorizer": "eosio", "account": "sfeevmpx", "ram": -1, "net": -1, "cpu": -1}' -p eosio@active
    cleos push action eosio setalimits '{"authorizer": "eosio", "account": "evmpx", "ram": -1, "net": -1, "cpu": -1}' -p eosio@active
    cleos push action eosio setalimits '{"authorizer": "eosio", "account": "bvmpx", "ram": -1, "net": -1, "cpu": -1}' -p eosio@active
    cleos push action eosio setalimits '{"authorizer": "eosio", "account": "tokenlinker", "ram": -1, "net": -1, "cpu": -1}' -p eosio@active
}

setup_permission() {
    cleos.sh set account permission evmpx transferer '{"threshold": 1, "keys": [], "accounts":[{"permission":{"actor": "tokenlinker", "permission":"active"}, "weight": 1}], "waits": [] }' active -p evmpx@active

    cleos.sh set action permission evmpx evmpx issue transferer -p evmpx@active
    cleos.sh set action permission evmpx evmpx transfer transferer -p evmpx@active
    cleos.sh set action permission evmpx evmpx burn transferer -p evmpx@active

    # set eosio.code permission for tokenlinker
    cleos.sh set account permission tokenlinker active --add-code -p tokenlinker@active

    # set eosio.code permission for tokenlinker
    cleos.sh set account permission --add-code swapvmpx active -p swapvmpx
}

setup_token_contract() {
    # create tokens
    cleos.sh push action evmpx create '["evmpx", "108624000.000000000 EVMPX"]' -p evmpx   # eVMPX
    cleos.sh push action bvmpx create '["bvmpx", "108624000.000000000 BVMPX"]' -p bvmpx   # bVMPX
}

issue_and_transfer_tokens() {
    # issue tokens
    cleos.sh push action evmpx issue '["evmpx", "500.000000000 EVMPX", "issue tokens for testing"]' -p evmpx

    cleos.sh push action bvmpx issue '["bvmpx", "500.000000000 BVMPX", "issue tokens for testing"]' -p bvmpx

    # transfer tokens
    cleos.sh push action evmpx transfer '["evmpx", "alice", "250.000000000 EVMPX", "transfer 250 EVMPX to alice"]' -p evmpx
    cleos.sh push action evmpx transfer '["evmpx", "bob", "250.000000000  EVMPX", "transfer 250 EVMPX to bob"]' -p evmpx

    cleos.sh push action bvmpx transfer '["bvmpx", "alice", "250.000000000 BVMPX", "transfer 250 BVMPX to alice"]' -p bvmpx
    cleos.sh push action bvmpx transfer '["bvmpx", "bob", "250.000000000 BVMPX", "transfer 250 BVMPX to bob"]' -p bvmpx
}

setup_swap_contract() {
    CLEOS="cleos.sh"
    YOUR_ACCOUNT_ALICE="alice"
    YOUR_ACCOUNT_BOB="bob"
    SWAPCONTRACT="swapvmpx"
    FEECONTRACT="sfeevmpx"
    B_SYMBOL="BVMPX"
    B_CONTRACT="bvmpx"
    B_PRECISION="9"
    B_AMT="100.000000000 BVMPX"
    E_SYMBOL="EVMPX"
    E_CONTRACT="evmpx"
    E_PRECISION="9"
    E_AMT="100.000000000 EVMPX"
    BE_SYMBOL="BEVMPX"
    BE_PRECISION="9"

    # ALICE - Open a channel for EVMPX coin
    $CLEOS push action $SWAPCONTRACT openext '["'"$YOUR_ACCOUNT_ALICE"'", "'"$YOUR_ACCOUNT_ALICE"'", {"contract":"'"$E_CONTRACT"'", "sym":"'"$E_PRECISION"','"$E_SYMBOL"'"}]' -p $YOUR_ACCOUNT_ALICE

    # ALICE - Open a channel for BVMPX coin
    $CLEOS push action $SWAPCONTRACT openext '["'"$YOUR_ACCOUNT_ALICE"'", "'"$YOUR_ACCOUNT_ALICE"'", {"contract":"'"$B_CONTRACT"'", "sym":"'"$B_PRECISION"','"$B_SYMBOL"'"}]' -p $YOUR_ACCOUNT_ALICE

    # BOB - Open a channel for EVMPX coin
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

trade() {
    # BOB - from BVMPX to EVMPX
    $CLEOS push action $B_CONTRACT transfer '["'"$YOUR_ACCOUNT_BOB"'", "'"$SWAPCONTRACT"'", "10.000000000 '"$B_SYMBOL"'", "exchange:BEVMPX, 9.000000000 '"$E_SYMBOL"', Trading BVMPX for EVMPX"]' -p $YOUR_ACCOUNT_BOB

    # ALICE - from EVMPX to BVMPX
    $CLEOS push action $E_CONTRACT transfer '["'"$YOUR_ACCOUNT_ALICE"'", "'"$SWAPCONTRACT"'", "10.000000000 '"$E_SYMBOL"'", "exchange:BEVMPX, 9.000000000 '"$B_SYMBOL"', Trading EVMPX for BVMPX"]' -p $YOUR_ACCOUNT_ALICE
}

remove_liquidity() {
    # BOB - Remove liquidity
    $CLEOS push action $SWAPCONTRACT remliquidity '["'"$YOUR_ACCOUNT_BOB"'", "1.000000000 '$BE_SYMBOL'", "1.000000000 '"$B_SYMBOL"'", "1.000000000 '"$E_SYMBOL"'"]' -p $YOUR_ACCOUNT_BOB
}
```

## Getting started
