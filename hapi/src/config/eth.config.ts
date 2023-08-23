import { ethers } from 'ethers'
import artifact from '../artifact'

export const httpEndpoint =
  process.env.HAPI_ETH_HTTP_ENDPOINT || 'https://eth-goerli.g.alchemy.com/v2'
export const wssEndpoint =
  process.env.HAPI_ETH_WSS_ENDPOINT || 'wss://eth-goerli.g.alchemy.com/v2'
export const alchemyApiKey = process.env.HAPI_ETH_ALCHEMY_KEY || 'api_key'
export const walletTokenAddress =
  process.env.HAPI_ETH_WALLET_TOKEN_ADDRESS || '0x'
export const walletAddress = process.env.HAPI_ETH_WALLET_ADDRESS || '0x'
export const walletKey = process.env.HAPI_ETH_WALLET_KEY || 'priv_key'
export const startingBlockNumber = Number(
  process.env.HAPI_ETH_START_BLOCK_NUMBER || 17608103
)

export const providerRpc = new ethers.providers.JsonRpcProvider(
  `${httpEndpoint}/${alchemyApiKey}`
)

export const wallet = new ethers.Wallet(walletKey, providerRpc)
export const vmpxContract = new ethers.Contract(
  walletTokenAddress,
  artifact.contractArtifact.abi,
  wallet
)
