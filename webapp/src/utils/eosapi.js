import EosApi from 'eosjs-api'

export const eosApi = EosApi({
  httpEndpoint: 'https://testnet.libre.org',
  verbose: false,
  fetchConfiguration: {}
})
