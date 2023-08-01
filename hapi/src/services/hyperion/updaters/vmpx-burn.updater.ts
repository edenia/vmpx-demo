import { ethers } from 'ethers'

import { eosConfig, ethConfig } from '../../../config'
import artifact from '../../../artifact'

const providerRpc = new ethers.providers.JsonRpcProvider(
  `${ethConfig.httpEndpoint}/${ethConfig.alchemyApiKey}`
)

const wallet = new ethers.Wallet(ethConfig.walletKey, providerRpc)
const vmpxContract = new ethers.Contract(
  ethConfig.walletTokenAddress,
  artifact.contractArtifact.abi,
  wallet
)

// TODO: convert it into a class
let nonce = 0

const sendFunds = async (ethAddress: string) => {
  const gasPrice = await providerRpc.getGasPrice()
  const toAddress = ethAddress
  if (!nonce) {
    nonce = await providerRpc.getTransactionCount(wallet.address, 'latest')
  }
  const amount = ethers.utils.parseUnits('0.1', 18)

  const tx = await vmpxContract.transfer(toAddress, amount, {
    gasLimit: gasPrice.mul(2),
    nonce
  })

  ++nonce

  console.log(`Transaction hash: ${tx.hash}`)
}

export default {
  type: `${eosConfig.vmpxContract}:burn`,
  apply: async (action: any) => {
    try {
      if (!action.data.memo) {
        return
      }

      console.log(`\nReturning funds to Ethereum`)

      const destinataryAddress = action.data.memo.split(':')[1]

      if (!destinataryAddress) {
        console.log('No destinatary address found')
        return
      }

      await sendFunds(destinataryAddress)
    } catch (error: any) {
      console.error(`error to sync ${action.action}: ${error.message}`)
    }
  }
}
