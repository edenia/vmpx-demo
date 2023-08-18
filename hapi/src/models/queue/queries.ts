import { gql } from 'graphql-request'

import { coreUtil } from '../../utils'
import { Queue, StatusType } from './interfaces'

interface QueueStateResponse {
  queue: Queue[]
}

interface QueueStateInsertOneResponse {
  insert_queue_one: {
    tx_hash: string
  }
}

export const save = async (tx: Queue) => {
  const mutation = gql`
    mutation ($payload: queue_insert_input!) {
      insert_queue_one(object: $payload) {
        tx_hash
      }
    }
  `

  const data =
    await coreUtil.hasura.default.request<QueueStateInsertOneResponse>(
      mutation,
      {
        payload: {
          ...tx
        }
      }
    )

  return data.insert_queue_one
}

export const update = async (tx_hash: string, newStatus: StatusType) => {
  const mutation = gql`
    mutation ($tx_hash: string!, $payload: queue_set_input) {
      update_queue_by_pk(pk_columns: { tx_hash: $tx_hash }, _set: $payload) {
        tx_hash
      }
    }
  `

  await coreUtil.hasura.default.request(mutation, {
    tx_hash,
    payload: {
      status: newStatus
    }
  })
}

export const getCustom = async (query: string) => {
  const data = await coreUtil.hasura.default.request<QueueStateResponse>(query)

  return data.queue
}

export default {}
