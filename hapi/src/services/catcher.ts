// get transactions that are not yet stored in the database (from the last synced block to current block)

const MIN_ELAPSED_SECONDS = 60 // 1 minute
const MAX_TX_PER_FETCH = 1000

const catchOldEvents = async () => {
  // code
}

const catchWorker = () => {
  return {
    name: 'SYNC ACTIONS',
    intervalSec: 3,
    action: catchOldEvents
  }
}

export default { catchWorker }
