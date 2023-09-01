import { ethers } from 'ethers'

import { transactionModel } from '../models'
import { eosConfig, ethConfig } from '../config'

import eosUtil from './eos.util'
import coingeckoUtil from './coingecko.util'
import financeUtil from './finance.util'

export const formatEthAction = async (
  payload: transactionModel.EthTrxPayload
) => {
  if (!ethers.utils.isAddress(payload.ethAddress)) {
    throw new Error('Invalid Ethereum address')
  }

  // TODO: apply fee reduction (get the costs of gas and then take that out of the eVMPX)
  // - get price of ETH
  // - get cost of tx on ETH
  // - get price of VMPX from swap (BVMPX / PBTC)
  // - convert that price to USD (should be done from the API already)
  // - calculate how much EVMPX should be taken to make up for the gas fee on ETH + 1%

  const ethPriceUsd = await coingeckoUtil.getEthPrice()
  const vmpxPriceUsd = await coingeckoUtil.getVmpxPrice()

  console.log(`ethPriceUsd: ${ethPriceUsd}`)
  console.log(`vmpxPriceUsd: ${vmpxPriceUsd}`)

  const address = payload.ethAddress
  const quantity = payload.quantity.toString()

  const nonce = await ethConfig.providerRpc.getTransactionCount(
    ethConfig.wallet.address,
    'latest'
  )

  const weiGasPrice = await ethConfig.providerRpc.getGasPrice()
  console.log(`gasPrice: ${weiGasPrice.toString()}`)
  const gasLimit = await ethConfig.vmpxContract.estimateGas.transfer(
    address,
    quantity
  )

  const weiTxGasCost = gasLimit.mul(weiGasPrice)

  console.log(`weiTxGasCost: ${weiTxGasCost.toString()}`)
  const dollarTxGasCost = financeUtil.convertWeiToDollar(
    weiTxGasCost,
    ethPriceUsd
  )
  console.log(`dollarTxGasCost: ${dollarTxGasCost.toString()}`)
  const dollarVmpxTransferAmount = financeUtil.convertVmpxToDollar(
    payload.quantity,
    vmpxPriceUsd
  )
  console.log(
    `dollarVmpxTransferAmount: ${dollarVmpxTransferAmount.toString()}`
  )
  // TODO: validate dollarTxGasCost is less than dollarVmpxTransferAmount
  const dollarTransferAmount = dollarVmpxTransferAmount.minus(dollarTxGasCost)
  console.log(`dollarTransferAmount: ${dollarTransferAmount.toString()}`)

  const vmpxQuantityTransfer = financeUtil.convertDollarToVmpx(
    dollarTransferAmount,
    vmpxPriceUsd
  )
  console.log(`vmpxQuantityTransfer: ${vmpxQuantityTransfer.toString()}`)

  console.log(`gasLimit: ${gasLimit.toString()}`)
  const adjustedWeiGasPrice = weiGasPrice
    .mul(ethers.BigNumber.from(120))
    .div(100)
  console.log(`adjustedWeiGasPrice: ${adjustedWeiGasPrice.toString()}`)
  const unsignedTx = await ethConfig.vmpxContract.populateTransaction.transfer(
    address,
    vmpxQuantityTransfer.toString(),
    {
      gasLimit: gasLimit.mul(ethers.BigNumber.from(120)).div(100),
      gasPrice: adjustedWeiGasPrice,
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
