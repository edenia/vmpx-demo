import moment, { DurationInputArg2 } from 'moment'

import { hyperionConfig } from '../../../config'
import { coreUtil, timeUtil } from '../../../utils'
import { hyperionStateModel } from '../../../models'

import updaters from './updaters'

interface GetActionsParams {
  after: string
  before: string
  skip: number
}

interface GetActionsResponse {
  hasMore: boolean
  actions: any[]
}

const getLastSyncedAt = async () => {
  const state = await hyperionStateModel.queries.getState()

  if (state) {
    return state.lastSyncedAt
  }

  await hyperionStateModel.queries.saveOrUpdate(hyperionConfig.startAt)

  return hyperionConfig.startAt
}

const getGap = (lastSyncedAt: string) => {
  if (
    moment().diff(moment(lastSyncedAt), 'seconds') >=
    hyperionConfig.maxTimeHyperionActionSec
  ) {
    return {
      amount: hyperionConfig.maxTimeHyperionActionSec,
      unit: 'seconds'
    }
  }

  return {
    amount: 1,
    unit: 'seconds'
  }
}

const getActions = async (
  params: GetActionsParams
): Promise<GetActionsResponse> => {
  const limit = 100
  const { data } = await coreUtil.axios.default.get(
    `${hyperionConfig.api}/v2/history/get_actions`,
    {
      params: {
        ...params,
        limit,
        filter: updaters.map(updater => updater.type).join(','),
        sort: 'asc',
        simple: true,
        checkLib: false
      }
    }
  )

  // NOTE: disabled temporarily to listen for action before LIB is reached
  // const notIrreversible = data.simple_actions.find(
  //   (item: any) => !item.irreversible
  // )

  // if (notIrreversible) {
  //   await timeUtil.sleep(1)

  //   return getActions(params)
  // }

  return {
    hasMore: data.total.value > limit + params.skip || false,
    actions: data.simple_actions
  }
}

const runUpdaters = async (actions: any[]) => {
  for (let index = 0; index < actions.length; index++) {
    const action = actions[index]
    const updater = updaters.find(item =>
      item.type.startsWith(`${action.contract}:${action.action}`)
    )

    if (!updater) {
      continue
    }

    await updater.apply(action)
  }
}

const sync = async (): Promise<void> => {
  // console.log('\nHyperion: syncing actions...')
  await coreUtil.hasura.hasuraAssembled()
  const lastSyncedAt = await getLastSyncedAt()
  const gap = getGap(lastSyncedAt)
  const after = moment(lastSyncedAt).toISOString()
  const before = moment(after)
    .add(gap.amount, gap.unit as DurationInputArg2)
    .toISOString()
  const diff = moment().diff(moment(before), 'seconds')

  // console.log(`Getting batch from: ${after} to ${before}`)

  let skip = 0
  let hasMore = true
  let actions = []

  if (diff < hyperionConfig.maxTimeHyperionActionSec) {
    console.log(
      `Waiting for next check: ${
        hyperionConfig.maxTimeHyperionActionSec - diff
      } seconds left`
    )
    await timeUtil.sleep(hyperionConfig.maxTimeHyperionActionSec - diff)

    return sync()
  }

  try {
    while (hasMore) {
      ;({ hasMore, actions } = await getActions({ after, before, skip }))
      skip += actions.length
      // console.log(`Total actions found: ${actions.length}`)
      await runUpdaters(actions)
    }
  } catch (error: any) {
    console.error('hyperion error', error.message)
    await timeUtil.sleep(5)

    return sync()
  }

  await hyperionStateModel.queries.saveOrUpdate(before)

  return sync()
}

const syncWorker = () => {
  console.log('🟢🟢🟢 Hyperion action listener is up and running')

  return {
    name: 'SYNC ACTIONS',
    action: sync
  }
}

export default { syncWorker }
