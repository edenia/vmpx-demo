import { ethers } from 'ethers'

import { transactionModel } from '../models'
import { eosConfig, ethConfig } from '../config'

import eosUtil from './eos.util'
import coingeckoUtil from './coingecko.util'
import financeUtil from './finance.util'

export const estimateTrxCost = async (
  payload: transactionModel.EthTrxPayload
) => {
  if (!ethers.utils.isAddress(payload.ethAddress)) {
    throw new Error('Invalid Ethereum address')
  }

  const ethPriceUsd = await coingeckoUtil.getEthPrice()
  const vmpxPriceUsd = await coingeckoUtil.getVmpxPrice()

  const address = payload.ethAddress
  const quantity = payload.quantity.toString()

  const weiGasPrice = await ethConfig.providerRpc.getGasPrice()
  const gasLimit = await ethConfig.vmpxContract.estimateGas.transfer(
    address,
    quantity
  )

  const weiTxGasCost = gasLimit.mul(weiGasPrice)
  const usdTxGasCost = financeUtil.convertWeiToUsd(weiTxGasCost, ethPriceUsd)
  const usdVmpxTransferAmount = financeUtil.convertVmpxToUsd(
    payload.quantity,
    vmpxPriceUsd
  )

  if (usdTxGasCost.isGreaterThanOrEqualTo(usdVmpxTransferAmount)) {
    throw new Error('Amount is too small to cover gas costs')
  }

  const usdTransferAmount = usdVmpxTransferAmount
    .minus(usdTxGasCost)
    .multipliedBy(1 - 0.01) // -1% fixed fee
  const vmpxQuantityTransfer = financeUtil.convertUsdToVmpx(
    usdTransferAmount,
    vmpxPriceUsd
  )
  const adjustedWeiGasPrice = weiGasPrice
    .mul(ethers.BigNumber.from(120))
    .div(100)

  return {
    ethPriceUsd,
    vmpxPriceUsd,
    usdTxGasCost,
    fixedFee: 1,
    vmpxTrxCost: payload.quantity.sub(vmpxQuantityTransfer.toString()),
    gasLimit,
    weiGasPrice,
    vmpxQuantityTransfer,
    adjustedWeiGasPrice
  }
}

export const formatEthAction = async (
  payload: transactionModel.EthTrxPayload
) => {
  const txData = await estimateTrxCost(payload)
  const nonce = await ethConfig.providerRpc.getTransactionCount(
    ethConfig.wallet.address,
    'latest'
  )

  return await ethConfig.vmpxContract.populateTransaction.transfer(
    payload.ethAddress,
    txData.vmpxQuantityTransfer.toString(),
    {
      gasLimit: txData.gasLimit.mul(ethers.BigNumber.from(105)).div(100),
      gasPrice: txData.adjustedWeiGasPrice,
      nonce
    }
  )
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

  const address = payload.ethAddress
  const quantity = ethers.utils.formatUnits(payload.quantity, 18)
  const formattedQuantity = quantity
    .padEnd(quantity.indexOf('.') + 1 + 9, '0')
    .substring(0, quantity.indexOf('.') + 1 + 9)

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
  const serializedActions = await eosUtil.serializeActions(actions)
  const info = await eosUtil.rpc.get_info()

  return eosUtil.serializeTransaction({
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
