// this file will handle the sending a trx to be signed by the signer and send it to the blockchain (ethereum or libre)
import { ethConfig } from '../config'
import { transactionModel } from '../models'
import { trxAdapterUtil, eosUtil, ethUtil } from '../utils'
// import { TransactResult } from 'eosjs/dist/eosjs-api-interfaces'
// import { ReadOnlyTransactResult } from 'eosjs/dist/eosjs-rpc-interfaces'

// move funds from ethereum to antelopeio
export const pegin = async (payload: transactionModel.EthTrxPayload) => {
  const unsignedTx = await trxAdapterUtil.formatAntelopeAction(payload)
  const signedTx = await eosUtil.default.signTx(unsignedTx)
  const tx = await eosUtil.default.pushSignedTx(signedTx)

  // console.log(
  //   `Pegin: transaction hash -- ${
  //     tx.processed?.id ??
  //     tx.transaction_id ??
  //     'Transaction failed to be processed'
  //   }`
  // )

  // TODO: save tx in database
}

// move funds from antelopeio to ethereum
export const pegout = async (payload: transactionModel.EthTrxPayload) => {
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
