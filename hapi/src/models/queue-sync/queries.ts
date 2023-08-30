import { gql } from 'graphql-request'

import { coreUtil } from '../../utils'
import { QueueSync, StatusType, Status } from './interfaces'

interface QueueSyncResponse {
  queue_sync: QueueSync[]
}

export interface QueueSyncAggregateResponse {
  queue_sync_aggregate: {
    aggregate: {
      max: {
        to_block: number
      }
    }
  }
}

interface QueueSyncInsertOneResponse {
  insert_queue_sync_one: {
    id: string
  }
}

interface QueueSyncUpdateResponse {
  update_queue_sync_by_pk: {
    id: string
  }
}

export const save = async (payload: QueueSync) => {
  const mutation = gql`
    mutation ($payload: queue_sync_insert_input!) {
      insert_queue_sync_one(object: $payload) {
        id
      }
    }
  `
  const data =
    await coreUtil.hasura.default.request<QueueSyncInsertOneResponse>(
      mutation,
      {
        payload
      }
    )

  return data.insert_queue_sync_one
}

export const update = async (
  id: string,
  totalSynced: number,
  status: StatusType = Status.pending
) => {
  const mutation = gql`
    mutation ($id: uuid!, $payload: queue_sync_set_input) {
      update_queue_sync_by_pk(pk_columns: { id: $id }, _set: $payload) {
        id
      }
    }
  `
  const data = await coreUtil.hasura.default.request<QueueSyncUpdateResponse>(
    mutation,
    { id, payload: { total_synced: totalSynced, status } }
  )

  return data.update_queue_sync_by_pk
}

export const getCustom = async <T = QueueSyncResponse>(
  query: string,
  filter: any = {}
): Promise<T> => {
  return await coreUtil.hasura.default.request<T>(query, filter)
}

export const getNextQueueSync = async (): Promise<QueueSync | null> => {
  const query = gql`
    query {
      queue_sync(
        where: { status: { _eq: "${Status.pending}" } }
        order_by: { created_at: asc }
        limit: 1
      ) {
        id
        from_block
        to_block
        total_synced
        status
      }
    }
  `
  const {
    queue_sync: [queueSync]
  } = await getCustom(query)

  return queueSync || null
}

export const getMaxToBlock = async (): Promise<number> => {
  const query = gql`
    query {
      queue_sync_aggregate {
        aggregate {
          max {
            to_block
          }
        }
      }
    }
  `
  const {
    queue_sync_aggregate: {
      aggregate: { max }
    }
  } = await getCustom<QueueSyncAggregateResponse>(query)

  return max.to_block || 0
}

export default {}
