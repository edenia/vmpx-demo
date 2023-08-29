import hyperionService from './hyperion'
import workerService from '../worker'
import ethListenerService from './eth-listener'
import payerService from '../payer'
import catcherService from '../catcher'
import { timeUtil } from '../../utils'

const start = async () => {
  workerService.run(hyperionService.syncWorker())
  workerService.run(payerService.workerFetcher())

  // sync with eth-listener and later with catcher
  // eth-listener will call the logic to check how many blocks are missing
  // since the last time the server was running
  ethListenerService.listenForEvents()
  await timeUtil.sleep(5)
  workerService.run(catcherService.catchWorker())
}

export default { start }
