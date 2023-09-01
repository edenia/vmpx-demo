import { ethers } from 'ethers'
import artifact from '../artifact'

export const httpEndpoint =
  process.env.HAPI_ETH_HTTP_ENDPOINT || 'https://eth-sepolia.g.alchemy.com/v2'
export const wssEndpoint =
  process.env.HAPI_ETH_WSS_ENDPOINT || 'wss://eth-sepolia.g.alchemy.com/v2'
export const alchemyApiKey = process.env.HAPI_ETH_ALCHEMY_KEY || 'api_key'
export const walletTokenAddress =
  process.env.HAPI_ETH_WALLET_TOKEN_ADDRESS || '0x'
export const walletAddress = process.env.HAPI_ETH_WALLET_ADDRESS || '0x'
export const walletKey = process.env.HAPI_ETH_WALLET_KEY || 'priv_key'
export const startingBlockNumber = Number(
  process.env.HAPI_ETH_START_BLOCK_NUMBER || 17608103
)
export const blocksToFetchByCatcher = Number(
  process.env.HAPI_ETH_BLOCKS_TO_FETCH_BY_CATCHER || 100
)
export const intervalFetcherSec = Number(
  process.env.HAPI_ETH_INTERVAL_FETCHER_SEC || 60
)

if (intervalFetcherSec < 60) {
  throw new Error('Less than 60 seconds is not safe to fetch passed events')
}

export const providerRpc = new ethers.providers.JsonRpcProvider(
  `${httpEndpoint}/${alchemyApiKey}`
)

export const wallet = new ethers.Wallet(walletKey, providerRpc)
export const vmpxContract = new ethers.Contract(
  walletTokenAddress,
  artifact.contractArtifact.abi,
  wallet
)
