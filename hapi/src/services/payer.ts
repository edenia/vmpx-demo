import { ethConfig } from '../config'
import { trxAdapterUtil, eosUtil, ethUtil } from '../utils'
import { actionModel, transactionModel } from '../models'

// move funds from ethereum to antelopeio
export const pegin = async (
  event: actionModel.EthEvent,
  payload: transactionModel.EthTrxPayload
) => {
  console.log(`Pegging in funds for tx: ${event.transactionHash}`)

  const unsignedTx = await trxAdapterUtil.formatAntelopeAction(payload)
  const signedTx = await eosUtil.default.signTx(unsignedTx)
  const tx = await eosUtil.default.pushSignedTx(signedTx)

  if (!tx) {
    console.log('Transaction failed to be processed')
  }

  console.log(
    `Pegin: transaction hash -- ${
      'transaction_id' in tx ? tx.transaction_id : tx.result
    }`
  )

  // TODO: save tx in database
}

// move funds from antelopeio to ethereum
export const pegout = async (
  action: actionModel.HyperionAction,
  payload: transactionModel.EthTrxPayload
) => {
  console.log(`Pegging out funds for tx: ${action.transaction_id}`)

  const unsignedTx = await trxAdapterUtil.formatEthAction(payload)
  const signedTx = await ethUtil.signEthTx(unsignedTx)
  const tx = await ethConfig.providerRpc.sendTransaction(signedTx)

  console.log(`Pegout: transaction hash -- ${tx.hash}`)

  // TODO: save tx in database
}

export default {
  pegin,
  pegout
}
