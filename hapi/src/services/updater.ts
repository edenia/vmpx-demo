import { queueModel } from '../models'
import { gql } from 'graphql-request'

export const isTransactionPendingOrFailed = async (tx_hash: string) => {
  const query = gql`
        query {
            queue(
                limit: 1
                order_by: { created_at: asc }
                where: {
                    tx_hash: { _eq: "${tx_hash}" },
                    status: { _in: [ "${queueModel.interfaces.Status.pending}", "${queueModel.interfaces.Status.failed}" ] }
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
  await queueModel.queries.update(tx_hash, queueModel.interfaces.Status.failed)
}

export default { isTransactionPendingOrFailed, setCompleted, setFailed }
