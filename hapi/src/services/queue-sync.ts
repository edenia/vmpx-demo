import { queueSyncModel, queueModel } from '../models'
import { ethConfig } from '../config'

export const addNewQueueSync = async (currentBlock: number) => {
  const lastBlock = await queueModel.queries.getLastBlockNumber(
    queueModel.interfaces.Operation.pegin
  )

  if (
    lastBlock === currentBlock ||
    ethConfig.startingBlockNumber >= currentBlock
  ) {
    console.log('Skipping sync queue, no blocks to sync...')

    return
  }

  const maxStoredToBlock = await queueSyncModel.queries.getMaxToBlock()
  let fromBlock =
    lastBlock !== 0 ? lastBlock + 1 : ethConfig.startingBlockNumber
  const toBlock = currentBlock - 1

  if (maxStoredToBlock >= fromBlock) {
    fromBlock = maxStoredToBlock + 1
  }

  if (fromBlock >= toBlock) {
    console.log('Skipping sync queue, no blocks to sync...')

    return
  }

  try {
    await queueSyncModel.queries.save({
      from_block: fromBlock,
      to_block: toBlock,
      total_synced: 0
    })

    console.log(
      `🎫🎫🎫 New queue sync added: ${fromBlock} - ${toBlock}: ${
        toBlock - fromBlock
      }`
    )
  } catch (error) {
    console.log(`🔥🔥🔥 Failed to save queue sync: ${error}`)
  }
}

export const markCompleted = async (id: string, totalSynced: number) => {
  try {
    await queueSyncModel.queries.update(
      id,
      totalSynced,
      queueSyncModel.interfaces.Status.completed
    )
  } catch (error) {
    console.log(`🔥🔥🔥 Failed to update queue sync: ${error}`)
  }
}

export default { addNewQueueSync, markCompleted }
