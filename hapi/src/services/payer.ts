import { gql } from 'graphql-request'

import { ethConfig, serverConfig } from '../config'
import { trxAdapterUtil, eosUtil, ethUtil, parserUtil } from '../utils'
import { actionModel, transactionModel, queueModel } from '../models'
import updaterService from './updater'

// move funds from ethereum to libre
export const pegin = async (
  event: actionModel.EthEvent,
  payload: transactionModel.EthTrxPayload
) => {
  console.log(`Pegging in funds for tx: ${event.transactionHash}`)

  const isTxIncompleted = await updaterService.isTransactionPendingOrFailed(
    event.transactionHash
  )

  if (!isTxIncompleted) {
    console.log(
      `🔥🔥🔥WARNING: Tried to peg-in tx hash ${event.transactionHash} but it is already processed`
    )
  }

  try {
    const unsignedTx = await trxAdapterUtil.formatAntelopeAction(payload)
    const signedTx = await eosUtil.default.signTx(unsignedTx)
    const tx = await eosUtil.default.pushSignedTx(signedTx)

    if (!tx) {
      console.log('Transaction failed to be processed')
    }

    await updaterService.setCompleted(event.transactionHash)

    console.log(
      `Pegin: transaction hash -- ${
        'transaction_id' in tx ? tx.transaction_id : tx.result
      }`
    )
  } catch (error: any) {
    console.log(
      `💣💣💣 Failed to peg-in tx ${event.transactionHash}: ${error.message}`
    )

    await updaterService.setFailed(event.transactionHash)
  }
}

// move funds from libre to ethereum
export const pegout = async (
  action: actionModel.HyperionAction,
  payload: transactionModel.EthTrxPayload
) => {
  console.log(`Pegging out funds for tx: ${action.transaction_id}`)

  const isTxIncompleted = await updaterService.isTransactionPendingOrFailed(
    action.transaction_id
  )

  if (!isTxIncompleted) {
    console.log(
      `🔥🔥🔥WARNING: Tried to peg-out tx id ${action.transaction_id} but it is already processed`
    )
  }

  try {
    const unsignedTx = await trxAdapterUtil.formatEthAction(payload)
    const signedTx = await ethUtil.signEthTx(unsignedTx)
    const tx = await ethConfig.providerRpc.sendTransaction(signedTx)

    if (!tx) {
      console.log('Transaction failed to be processed')
    }

    await updaterService.setCompleted(action.transaction_id)

    console.log(`Pegout: transaction hash -- ${tx.hash}`)
  } catch (error: any) {
    console.log(
      `💣💣💣 Failed to peg-out tx ${action.transaction_id}: ${error.message}`
    )

    await updaterService.setFailed(action.transaction_id)
  }
}

export const fetchPendingTransactions = async () => {
  const query = gql`
    query {
      queue(
        where: {
          status: {
            _in: [
              "${queueModel.interfaces.Status.pending}",
              "${queueModel.interfaces.Status.failed}"
            ]
          },
          retry_times: { _lte: ${serverConfig.maxRetrySendTx} }
        }
      ) {
        tx_hash
        operation
        fromto
        quantity
        status
        created_at
        updated_at
        block_number
        retry_times
      }
    }
  `
  const { queue: txs } = await queueModel.queries.getCustom(query)

  console.log(`Re-trying ${txs.length} pending transactions`)

  for (const tx of txs) {
    if (tx.operation === queueModel.interfaces.Operation.pegin) {
      const { event, payload } = parserUtil.fromQueueToEth(tx)
      await pegin(event, payload)
    } else {
      const { action, payload } = parserUtil.fromQueueToLibre(tx)
      await pegout(action, payload)
    }
  }
}

export const workerFetcher = () => {
  console.log('🟢🟢🟢 Fetcher is up and running')

  return {
    name: 'TRANSACTION FETCHER',
    intervalSec: 60,
    action: fetchPendingTransactions
  }
}

export default {
  pegin,
  pegout,
  workerFetcher
}
