import BigNumberJs from 'bignumber.js'
import { ethers } from 'ethers'

export const convertWeiToUsd = (wei: ethers.BigNumber, ethPriceUsd: string) => {
  const weiBigNumber = new BigNumberJs(ethers.utils.formatEther(wei))
  const ethPriceUsdBigNumber = new BigNumberJs(ethPriceUsd)

  return weiBigNumber.multipliedBy(ethPriceUsdBigNumber)
}

export const convertVmpxToUsd = (
  vmpx: ethers.BigNumber,
  vmpxPriceUsd: string
) => {
  const vmpxBigNumber = new BigNumberJs(ethers.utils.formatEther(vmpx))
  const vmpxPriceUsdBigNumber = new BigNumberJs(vmpxPriceUsd)

  return vmpxBigNumber.multipliedBy(vmpxPriceUsdBigNumber)
}

export const convertUsdToVmpx = (
  usdAmount: BigNumberJs,
  vmpxPriceUsd: string
) => {
  const vmpxPriceUsdBigNumber = new BigNumberJs(vmpxPriceUsd)
  const vmpx = usdAmount.dividedBy(vmpxPriceUsdBigNumber).toFixed(18)

  return new BigNumberJs(vmpx).multipliedBy(1e18)
}

export default { convertWeiToUsd, convertVmpxToUsd, convertUsdToVmpx }
