import EosApi from 'eosjs-api'

export const eosApi = EosApi({
  httpEndpoint: 'https://api.testnet.libre.cryptobloks.io',
  verbose: false,
  fetchConfiguration: {}
})
