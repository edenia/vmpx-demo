import { BigNumber } from 'ethers'

export interface EthTrxPayload {
  ethAddress: string
  quantity: BigNumber
}

export interface LibreTrxPayload {
  ethAddress: string
  quantity: BigNumber
}
