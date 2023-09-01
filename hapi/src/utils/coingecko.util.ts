import { apiConfig } from '../config'

import axios from './core/axios.core'

const query = async (coin: string, currency: string) => {
  try {
    const response = await axios.get(
      `${apiConfig.coingeckoApiUrl}/simple/price?ids=${coin}&vs_currencies=${currency}`
    )

    return response.data
  } catch (error: any) {
    console.error(`Failed to get ${coin.toUpperCase()} price: ${error.message}`)
  }
}

export const getVmpxPrice = async () => {
  const data = await query('vmpx', 'usd')

  return data.vmpx.usd || 0
}

export const getEthPrice = async () => {
  const data = await query('ethereum', 'usd')

  return data.ethereum.usd || 0
}

export default { getVmpxPrice, getEthPrice }
