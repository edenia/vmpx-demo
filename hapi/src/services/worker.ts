import { timeUtil, coreUtil } from '../utils'
import hyperionService from './hyperion'
import { defaultModel } from '../models'

const run = async (worker: defaultModel.Worker) => {
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

  run(hyperionService.syncWorker())
}

export default {
  init
}
