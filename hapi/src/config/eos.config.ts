export const endpoint =
  process.env.HAPI_NETWORK_API || 'https://testnet.libre.org'
export const chainId =
  process.env.HAPI_NETWORK_CHAIN_ID ||
  'b64646740308df2ee06c6b72f34c0f7fa066d940e831f752db2006fcc2b78dee'
export const vmpxContract = process.env.HAPI_VMPX_CONTRACT || 'evmpx'
export const dispenserContract =
  process.env.HAPI_DISPENSER_CONTRACT || 'tokenlinker'
export const dispenserContractPublicKey =
  process.env.HAPI_DISPENSER_CONTRACT_PUBLIC_KEY || 'pub_key'
export const dispenserContractPrivateKey =
  process.env.HAPI_DISPENSER_CONTRACT_PRIVATE_KEY || 'priv_key'
