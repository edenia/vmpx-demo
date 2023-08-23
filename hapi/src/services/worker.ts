import { timeUtil, coreUtil } from '../utils'
import { defaultModel } from '../models'

let isInitialized = false

export const run = async (worker: defaultModel.Worker) => {
  if (!isInitialized) {
    throw new Error('Worker service not initialized')
  }

  try {
    await worker.action()
  } catch (error: any) {
    console.log(`${worker.name} ERROR =>`, error.message)
  }

  if (!worker.intervalSec) {
    return
  }

  await timeUtil.sleep(worker.intervalSec)
  run(worker)
}

const init = async () => {
  await coreUtil.hasura.hasuraAssembled()

  isInitialized = true
}

export default {
  init,
  run
}
