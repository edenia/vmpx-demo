import { ethers } from 'ethers'

import { ethConfig } from '../../config'
import artifact from '../../artifact'
import payerService from '../payer'
import { actionModel } from '../../models'

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
  vmpxContract.on(filter, (from, to, amount, event: actionModel.EthEvent) => {
    const value = Number(ethers.utils.formatUnits(amount, 18)).toFixed(9)

    console.log(JSON.stringify({ from, to, value }, null, 4))

    payerService.pegin(event, { ethAddress: from, quantity: amount })
  })
}

export default { listenForEvents }
