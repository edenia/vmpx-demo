import hyperionService from './hyperion'
import workerService from '../worker'
import ethListenerService from './eth-listener'
import payerService from '../payer'
import catcherService from '../catcher'

const start = async () => {
  workerService.run(hyperionService.syncWorker())
  workerService.run(payerService.workerFetcher())

  // sync with catcher and later with eth-listener
  await workerService.run(catcherService.catchWorker())
  ethListenerService.listenForEvents()
}

export default { start }
