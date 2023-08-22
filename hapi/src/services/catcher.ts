import { gql } from 'graphql-request'

import { ethConfig } from '../config'
import { queueModel } from '../models'
import { parserUtil } from '../utils'

const BLOCKS_TO_FETCH = 10

const catchOldEvents = async (fromBlock: number, toBlock: number) => {
  let currentBlock = fromBlock

  console.log(`Catching up blocks from: ${fromBlock} to: ${toBlock}`)
  console.log(`🔥🔥🔥 Catching gap of ${toBlock - fromBlock} blocks`)

  const calcNextBlockBatch = (currentBlock: number, toBlock: number) =>
    toBlock - currentBlock >= BLOCKS_TO_FETCH
      ? BLOCKS_TO_FETCH
      : toBlock - currentBlock

  for (
    let steps = calcNextBlockBatch(currentBlock, toBlock);
    steps > 0;
    steps = calcNextBlockBatch(currentBlock, toBlock)
  ) {
    const filter = ethConfig.vmpxContract.filters.Transfer(
      null,
      ethConfig.walletAddress
    )

    console.log(
      `⛓️⛓️⛓️ Filtering events from block ${currentBlock} to ${currentBlock + steps}`
    )

    const logs = await ethConfig.vmpxContract.queryFilter(
      filter,
      currentBlock,
      currentBlock + steps
    )

    console.log(`Saving ${logs.length} passed events`)

    for (const log of logs) {
      const [from, , amount] = log.args || []
      const queue = parserUtil.fromEthToQueue(log, {
        ethAddress: from,
        quantity: amount
      })

      try {
        await queueModel.queries.save(queue) // store to db
      } catch (error) {
        console.log(`Failed to save event: ${error}`)
      }
    }

    currentBlock += steps + 1
  }

  console.log('🧾🧾🧾 Old events were saved')
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

  if (!block.block_number) {
    await catchOldEvents(ethConfig.startingBlockNumber, currentBlock)
  }

  if (currentBlock > block.block_number) {
    await catchOldEvents(block.block_number + 1, currentBlock)
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
