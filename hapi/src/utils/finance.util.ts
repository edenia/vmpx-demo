import BigNumberJs from 'bignumber.js'
import { ethers } from 'ethers'

export const convertWeiToDollar = (
  wei: ethers.BigNumber,
  ethPriceUsd: string
) => {
  const weiBigNumber = new BigNumberJs(ethers.utils.formatEther(wei))
  const ethPriceUsdBigNumber = new BigNumberJs(ethPriceUsd)

  return weiBigNumber.multipliedBy(ethPriceUsdBigNumber)
}

export const convertVmpxToDollar = (
  vmpx: ethers.BigNumber,
  vmpxPriceUsd: string
) => {
  const vmpxBigNumber = new BigNumberJs(ethers.utils.formatEther(vmpx))
  const vmpxPriceUsdBigNumber = new BigNumberJs(vmpxPriceUsd)

  return vmpxBigNumber.multipliedBy(vmpxPriceUsdBigNumber)
}

export const convertDollarToVmpx = (
  dollarAmount: BigNumberJs,
  vmpxPriceUsd: string
) => {
  console.log(`dollarAmount: ${dollarAmount.toString()}`)
  console.log(`vmpxPriceUsd: ${vmpxPriceUsd.toString()}`)

  const vmpxPriceUsdBigNumber = new BigNumberJs(vmpxPriceUsd)
  const vmpx = dollarAmount.dividedBy(vmpxPriceUsdBigNumber).toFixed(18)

  console.log(`vmpx: ${vmpx.toString()}`)

  return new BigNumberJs(vmpx).multipliedBy(1e18)
}

export default { convertWeiToDollar, convertVmpxToDollar, convertDollarToVmpx }
