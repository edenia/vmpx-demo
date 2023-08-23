import { ethers } from 'ethers'

import { ethConfig } from '../config'
import artifact from '../artifact'
import payerService from './payer'

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
  vmpxContract.on(filter, (from, to, amount, event) => {
    console.log('🚀 ~ vmpxContract.on ~ Transfer')

    const info = {
      from: from,
      to: to,
      value: Number(ethers.utils.formatUnits(amount, 18)).toFixed(9)
    }

    console.log(JSON.stringify(info, null, 4))

    payerService.pegin({ ethAddress: from, quantity: amount })
  })
}

export default { listenForEvents }
