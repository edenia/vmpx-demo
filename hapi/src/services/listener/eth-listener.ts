import { ethers } from 'ethers'

import { ethConfig } from '../../config'
import artifact from '../../artifact'
import payerService from '../payer'
import { actionModel, queueModel } from '../../models'
import { parserUtil } from '../../utils'

const listenForEvents = async () => {
  console.log('🟢🟢🟢 Ethereum event listener is up and running')

  const provider = new ethers.providers.WebSocketProvider(
    `${ethConfig.wssEndpoint}/${ethConfig.alchemyApiKey}`
  )
  const vmpxContract = new ethers.Contract(
    ethConfig.walletTokenAddress,
    artifact.contractArtifact.abi,
    provider
  )
  const filter = vmpxContract.filters.Transfer(null, ethConfig.walletAddress)

  vmpxContract.on(
    filter,
    async (from, to, amount, event: actionModel.EthEvent) => {
      const transferData = { ethAddress: from, quantity: amount }
      const queue = parserUtil.fromEthToQueue(event, transferData)

      if (Number(queue.quantity) <= 0) {
        console.log(`Skipping 0 balance transaction: ${queue.tx_hash}`)
        return
      }

      await queueModel.queries.save(queue) // store to db

      payerService.pegin(event, transferData)
    }
  )
}

// call this event until catcher has finished the starting sync

export default { listenForEvents }
