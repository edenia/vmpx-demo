import { ethers } from 'ethers'

import { ethConfig } from '../../config'
import artifact from '../../artifact'
import payerService from '../payer'
import { actionModel, queueModel } from '../../models'
import { parserUtil } from '../../utils'

const listenForEvents = async () => {
  const provider = new ethers.providers.WebSocketProvider(
    `${ethConfig.wssEndpoint}/${ethConfig.alchemyApiKey}`
  )
  const vmpxContract = new ethers.Contract(
    ethConfig.walletTokenAddress,
    artifact.contractArtifact.abi,
    provider
  )
  const filter = vmpxContract.filters.Transfer(null, ethConfig.walletAddress)

  // Receive an event when that filter occurs
  vmpxContract.on(
    filter,
    async (from, to, amount, event: actionModel.EthEvent) => {
      const value = Number(ethers.utils.formatUnits(amount, 18)).toFixed(9)

      console.log(JSON.stringify({ from, to, value }, null, 4))

      const transferData = { ethAddress: from, quantity: amount }
      const queue = parserUtil.fromEthToQueue(event, transferData)
      await queueModel.queries.save(queue) // store to db

      payerService.pegin(event, transferData)
    }
  )
}

export default { listenForEvents }
