import { gql } from 'graphql-request'

import { queueModel } from '../models'
import { serverConfig } from '../config'

export const isTransactionPendingOrFailed = async (tx_hash: string) => {
  const query = gql`
        query {
            queue(
                limit: 1
                order_by: { created_at: asc }
                where: {
                    tx_hash: { _eq: "${tx_hash}" },
                    status: { _in: [ "${queueModel.interfaces.Status.pending}", "${queueModel.interfaces.Status.failed}" ] },
                    retry_times: { _lte: ${serverConfig.maxRetrySendTx} }
                }
            ){
                tx_hash
                status
            }
        }
    `
  const { queue: txs } = await queueModel.queries.getCustom(query)

  return !!txs[0]
}

export const setCompleted = async (tx_hash: string) => {
  const result = await queueModel.queries.update(
    tx_hash,
    queueModel.interfaces.Status.completed
  )

  return !!result
}

export const setFailed = async (tx_hash: string) => {
  await queueModel.queries.update(
    tx_hash,
    queueModel.interfaces.Status.failed,
    1
  )
}

export default { isTransactionPendingOrFailed, setCompleted, setFailed }
