# VMPX Demo Contract

## Set required permission

```sh
setup_permission() {
    cleos -u https://testnet.libre.org set account permission vmpx transferer '{"threshold": 1, "keys": [], "accounts":[{"permission":{"actor": "tokenlinker", "permission":"active"}, "weight": 1}], "waits": [] }' active -p vmpx@active

    cleos -u https://testnet.libre.org set action permission vmpx vmpx issue transferer -p vmpx@active
    cleos -u https://testnet.libre.org set action permission vmpx vmpx transfer transferer -p vmpx@active
    cleos -u https://testnet.libre.org set action permission vmpx vmpx retire transferer -p vmpx@active

    # set eosio.code permission for tokenlinker
    cleos -u https://testnet.libre.org set account permission tokenlinker active --add-code -p tokenlinker@active
}
```

## Getting started
