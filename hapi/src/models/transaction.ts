import { Request } from '@hapi/hapi'
import { BigNumber } from 'ethers'

export interface EthTrxPayload {
  ethAddress: string
  quantity: BigNumber
}

export interface LibreTrxPayload {
  ethAddress: string
  quantity: BigNumber
}

export interface EthTrxPayloadRequest extends Request {
  payload: {
    input: {
      ethAddress: string
      quantity: string
    }
  }
}
