export const httpEndpoint =
  process.env.HAPI_ETH_HTTP_ENDPOINT || 'https://eth-goerli.g.alchemy.com/v2'
export const wssEndpoint =
  process.env.HAPI_ETH_WSS_ENDPOINT || 'wss://eth-goerli.g.alchemy.com/v2'
export const alchemyApiKey = process.env.HAPI_ETH_ALCHEMY_KEY || 'api_key'
export const walletTokenAddress =
  process.env.HAPI_ETH_WALLET_TOKEN_ADDRESS || '0x'
export const walletAddress = process.env.HAPI_ETH_WALLET_ADDRESS || '0x'
export const walletKey = process.env.HAPI_ETH_WALLET_KEY || 'priv_key'
