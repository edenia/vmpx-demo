import { actionModel, transactionModel, queueModel } from '../models'
// export interface Queue {
//   tx_hash: string
//   operation: OperationType
//   fromto: string
//   quantity: string
//   status: StatusType
//   created_at: Date
//   updated_at: Date
// }

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
    status
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
    status
  } as queueModel.interfaces.Queue)

export default {}
