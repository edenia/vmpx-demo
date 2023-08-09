import { ethers } from 'ethers'

import { eosUtil } from '../utils'
import { ethConfig, eosConfig } from '../config'
import artifact from '../artifact'

const provider = new ethers.providers.WebSocketProvider(
  `${ethConfig.wssEndpoint}/${ethConfig.alchemyApiKey}`
)

const sendFunds = async (ethAddress: string, amount: string) => {
  if (!ethers.utils.isAddress(ethAddress)) {
    throw new Error('Invalid Ethereum address')
  }

  const authorization = [
    {
      actor: eosConfig.dispenserContract,
      permission: 'active'
    }
  ]

  const actions = [
    {
      authorization,
      account: eosConfig.dispenserContract,
      name: 'sendfunds',
      data: {
        sender: ethAddress,
        quantity: `${amount} EVMPX`
      }
    }
  ]

  const trx = await eosUtil.default.transact(actions)

  console.log('Receipt:', trx)
}

const listenForEvents = async () => {
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

    sendFunds(from, Number(ethers.utils.formatUnits(amount, 18)).toFixed(9))
  })
}

export default { listenForEvents }
