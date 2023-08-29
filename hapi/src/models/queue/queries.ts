import { gql } from 'graphql-request'

import { coreUtil } from '../../utils'
import { Queue, Operation, OperationType, StatusType } from './interfaces'

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
  query: string,
  filter: any = {}
): Promise<T> => {
  return await coreUtil.hasura.default.request<T>(query, filter)
}

export const getLastBlockNumber = async (
  blockType: OperationType = Operation.pegin
) => {
  const query = gql`
    query ($block_type: String!)) {
      queue_aggregate(where: { operation: { _eq: $block_type } }) {
        aggregate {
          max {
            block_number
          }
        }
      }
    }
  `
  const {
    queue_aggregate: {
      aggregate: { max: block }
    }
  } = await getCustom<QueueAggregateResponse>(query, { block_type: blockType })

  return block.block_number || 0
}

export default {}
