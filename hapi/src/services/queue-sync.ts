import { queueSyncModel, queueModel } from '../models'

const addNewQueueSync = async (currentBlock: number) => {
  const lastBlock = await queueModel.queries.getLastBlockNumber(
    queueModel.interfaces.Operation.pegin
  )

  if (lastBlock === 0 || lastBlock === currentBlock) {
    console.log('Skipping sync queue, no blocks to sync...')

    return
  }

  const fromBlock = lastBlock + 1
  const toBlock = currentBlock - 1

  try {
    await queueSyncModel.queries.save({
      to_block: toBlock,
      from_block: fromBlock,
      total_synced: 0
    })

    console.log(`🎫🎫🎫 New queue sync added: ${fromBlock} - ${toBlock}`)
  } catch (error) {
    console.log(`🔥🔥🔥 Failed to save queue sync: ${error}`)
  }
}

const markCompleted = async (id: string, totalSynced: number) => {
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
