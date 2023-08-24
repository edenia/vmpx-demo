import { actionModel, transactionModel, queueModel } from '../models'

export const fromEthToQueue = (
  event: actionModel.EthEvent,
  payload: transactionModel.EthTrxPayload,
  status: queueModel.interfaces.StatusType = queueModel.interfaces.Status
    .pending
) =>
  ({
    tx_hash: event.transactionHash,
    operation: queueModel.interfaces.Operation.pegin,
    fromto: payload.ethAddress,
    quantity: payload.quantity.toString(),
    status,
    block_number: event.blockNumber
  } as queueModel.interfaces.Queue)

export const fromLibreToQueue = (
  action: actionModel.HyperionAction,
  payload: transactionModel.EthTrxPayload,
  status: queueModel.interfaces.StatusType = queueModel.interfaces.Status
    .pending
) =>
  ({
    tx_hash: action.transaction_id,
    operation: queueModel.interfaces.Operation.pegout,
    fromto: payload.ethAddress,
    quantity: payload.quantity,
    status,
    block_number: action.block
  } as queueModel.interfaces.Queue)

export const fromQueueToEth = (queue: queueModel.interfaces.Queue) => ({
  event: {
    transactionHash: queue.tx_hash,
    blockNumber: queue.block_number,
    blockHash: '',
    transactionIndex: -1,
    address: ''
  } as actionModel.EthEvent,
  payload: {
    ethAddress: queue.fromto,
    quantity: queue.quantity
  }
})

export const fromQueueToLibre = (queue: queueModel.interfaces.Queue) => ({
  action: {
    transaction_id: queue.tx_hash,
    block: queue.block_number,
    timestamp: '',
    contract: '',
    action: '',
    actors: '',
    notified: '',
    data: {
      account: '',
      quantity: queue.quantity,
      eth_address: ''
    }
  } as actionModel.HyperionAction,
  payload: {
    ethAddress: queue.fromto,
    quantity: queue.quantity
  }
})

export default {}
