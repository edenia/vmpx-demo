import { BigNumber } from 'ethers'

import { ethConfig } from '../config'
import { queueModel, queueSyncModel } from '../models'
import { queueSyncService } from '../services'
import { parserUtil } from '../utils'

const BLOCKS_TO_FETCH = 100

const catchOldEvents = async (
  queueSync: queueSyncModel.interfaces.QueueSync
) => {
  if (!queueSync.id) {
    throw new Error('Queue sync id is missing')
  }

  let currentBlock = queueSync.from_block + queueSync.total_synced

  console.log(
    `🔥🔥🔥 Catching up blocks from: ${queueSync.from_block} to: ${
      queueSync.to_block
    } with gap of ${queueSync.to_block - queueSync.from_block} blocks`
  )

  const calcNextBlockBatch = (currentBlock: number, toBlock: number) =>
    toBlock - currentBlock >= BLOCKS_TO_FETCH
      ? BLOCKS_TO_FETCH
      : toBlock - currentBlock

  for (
    let steps = calcNextBlockBatch(currentBlock, queueSync.to_block);
    steps > 0;
    steps = calcNextBlockBatch(currentBlock, queueSync.to_block)
  ) {
    const filter = ethConfig.vmpxContract.filters.Transfer(
      null,
      ethConfig.walletAddress
    )

    console.log(
      `⛓️⛓️⛓️ Filtering events from block ${currentBlock} to ${
        currentBlock + steps
      }, pending: ${queueSync.to_block - currentBlock} blocks`
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

      if (amount <= BigNumber.from(0)) {
        console.log(`Skipping 0 balance transaction: ${queue.tx_hash}`)
        continue
      }

      try {
        await queueModel.queries.save(queue)
      } catch (error) {
        console.log(`Failed to save event: ${error}`)
      }
    }

    await queueSyncModel.queries.update(
      queueSync.id,
      currentBlock + steps - queueSync.from_block
    )

    currentBlock += steps + 1
  }

  await queueSyncService.markCompleted(
    queueSync.id,
    currentBlock - 1 - queueSync.from_block
  )

  console.log(`🧾🧾🧾 Queue sync ${queueSync.id} is completed`)
}

export const startCatcher = async (): Promise<void> => {
  const nextQueueSync = await queueSyncModel.queries.getNextQueueSync()

  if (!nextQueueSync) {
    console.log('🏁🏁🏁 No pending queue syncs found, catcher is up-to-date')

    return
  }

  try {
    await catchOldEvents(nextQueueSync)
    // eslint-disable-next-line no-empty
  } catch (error) {}

  startCatcher()
}

const catchWorker = () => {
  console.log('🟢🟢🟢 Catcher is up and running')

  return {
    name: 'SYNC ACTIONS',
    action: startCatcher
  }
}

export default { catchWorker }
