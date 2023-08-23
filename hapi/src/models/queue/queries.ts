import { gql } from 'graphql-request'

import { coreUtil } from '../../utils'
import { Queue, StatusType } from './interfaces'

interface QueueResponse {
  queue: Queue[]
}

export interface QueueAggregateResponse {
  queue_aggregate: {
    aggregate: {
      max: {
        block_number: number
      }
    }
  }
}

interface QueueInsertOneResponse {
  insert_queue_one: {
    tx_hash: string
  }
}

interface QueueUpdateResponse {
  update_queue_by_pk: {
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
  const data = await coreUtil.hasura.default.request<QueueInsertOneResponse>(
    mutation,
    {
      payload: {
        ...tx
      }
    }
  )

  return data.insert_queue_one
}

export const update = async (
  tx_hash: string,
  newStatus: StatusType,
  retryTimes = 0
) => {
  const mutation = gql`
    mutation ($tx_hash: String!, $payload: queue_set_input) {
      update_queue_by_pk(
        pk_columns: { tx_hash: $tx_hash }
        _set: $payload
        _inc: { retry_times: ${retryTimes} }
      ) {
        tx_hash
      }
    }
  `
  const data = await coreUtil.hasura.default.request<QueueUpdateResponse>(
    mutation,
    {
      tx_hash,
      payload: {
        status: newStatus
      }
    }
  )

  return data.update_queue_by_pk
}

export const getCustom = async <T = QueueResponse>(
  query: string
): Promise<T> => {
  return await coreUtil.hasura.default.request<T>(query)
}

export default {}
