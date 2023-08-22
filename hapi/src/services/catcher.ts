import { gql } from 'graphql-request'

import { ethConfig } from '../config'
import { queueModel } from '../models'
import { parserUtil } from '../utils'

const BLOCKS_TO_FETCH = 10

const catchOldEvents = async (fromBlock: number, toBlock: number) => {
  const steps = Math.ceil((toBlock - fromBlock) / BLOCKS_TO_FETCH)

  // WORKING

  // TODO: fix duplicated keys issue
  const filter = {
    ...ethConfig.vmpxContract.filters.Transfer(null, ethConfig.walletAddress),
    fromBlock,
    toBlock
  }
  const logs = await ethConfig.vmpxContract.queryFilter(filter)

  console.log(`Saving ${logs.length} passed events`)

  for (const log of logs) {
    const [from, , amount] = log.args || []
    const queue = parserUtil.fromEthToQueue(log, {
      ethAddress: from,
      quantity: amount
    })

    await queueModel.queries.save(queue) // store to db
  }
}

export const prepareListener = async (): Promise<void> => {
  const query = gql`
    query {
      queue_aggregate(where: { operation: { _eq: "${queueModel.interfaces.Operation.pegin}" } }) {
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
  } =
    await queueModel.queries.getCustom<queueModel.queries.QueueAggregateResponse>(
      query
    )
  const currentBlock = await ethConfig.providerRpc.getBlockNumber()

  if (currentBlock < ethConfig.startingBlockNumber) {
    return
  }

  if (!block) {
    await catchOldEvents(ethConfig.startingBlockNumber, currentBlock)
  }

  if (currentBlock > block.block_number) {
    await catchOldEvents(block.block_number, currentBlock)
  }
}

const catchWorker = () => {
  console.log('🟢🟢🟢 Catcher is up and running')

  return {
    name: 'SYNC ACTIONS',
    // intervalSec: MIN_ELAPSED_SECONDS,
    action: prepareListener
  }
}

export default { catchWorker }
