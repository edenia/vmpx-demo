import hyperionService from './hyperion'
import workerService from '../worker'
import ethListener from './eth-listener'

const start = async () => {
  workerService.run(hyperionService.syncWorker())
  ethListener.listenForEvents()
}

export default { start }
