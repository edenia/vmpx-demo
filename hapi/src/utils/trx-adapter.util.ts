import { ethers } from 'ethers'

import { transactionModel } from '../models'
import { eosConfig, ethConfig } from '../config'
import { eosUtil } from '.'

export const formatEthAction = async (
  payload: transactionModel.EthTrxPayload
) => {
  if (!ethers.utils.isAddress(payload.ethAddress)) {
    throw new Error('Invalid Ethereum address')
  }

  const address = payload.ethAddress
  const quantity = payload.quantity.toString()

  const nonce = await ethConfig.providerRpc.getTransactionCount(
    ethConfig.wallet.address,
    'latest'
  )

  const gasPrice = await ethConfig.providerRpc.getGasPrice()
  const gasLimit = await ethConfig.vmpxContract.estimateGas.transfer(
    address,
    quantity
  )
  const adjustedGasPrice = gasPrice.mul(ethers.BigNumber.from(120)).div(100)
  const unsignedTx = await ethConfig.vmpxContract.populateTransaction.transfer(
    address,
    quantity,
    {
      gasLimit,
      gasPrice: adjustedGasPrice,
      nonce
    }
  )

  return unsignedTx
}

const reverseHex = (hexStr: string) => {
  return (
    hexStr.substr(6, 2) +
    hexStr.substr(4, 2) +
    hexStr.substr(2, 2) +
    hexStr.substr(0, 2)
  )
}

export const formatAntelopeAction = async (
  payload: transactionModel.EthTrxPayload
) => {
  if (!ethers.utils.isAddress(payload.ethAddress)) {
    throw new Error('Invalid Ethereum address')
  }

  // TODO: load 9 from .env
  const address = payload.ethAddress
  const quantity = ethers.utils.formatUnits(payload.quantity, 18)
  const formattedQuantity = quantity
    .padEnd(quantity.indexOf('.') + 10, '0')
    .substring(0, quantity.indexOf('.') + 10)

  const authorization = [
    {
      actor: eosConfig.dispenserContract,
      permission: 'active'
    }
  ]
  const actions = [
    {
      authorization,
      account: eosConfig.dispenserContract,
      name: 'sendfunds',
      data: {
        sender: address,
        quantity: `${formattedQuantity} EVMPX`
      }
    }
  ]
  const serializedActions = await eosUtil.default.serializeActions(actions)
  const info = await eosUtil.rpc.get_info()

  return eosUtil.default.serializeTransaction({
    actions: serializedActions,
    expiration: new Date(Date.now() + 30000).toISOString().split('.')[0],
    ref_block_num: info.last_irreversible_block_num & 0xffff,
    ref_block_prefix: parseInt(
      reverseHex(info.last_irreversible_block_id.substr(16, 8)),
      16
    )
  })
}

export default {}
