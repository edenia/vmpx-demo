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

const sendFunds = async (ethAddress: string, quantity: string) => {
  if (!nonce) {
    nonce = await providerRpc.getTransactionCount(wallet.address, 'latest')
  }
  // const amount =
  const gasLimit = await vmpxContract.estimateGas.transfer(
    ethAddress,
    quantity,
    {
      nonce
    }
  )
  const tx = await vmpxContract.transfer(ethAddress, quantity, {
    gasLimit: gasLimit.mul(2),
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

      console.log('Paying transaction')
      console.log({ ...action.data, transaction_id: action.transaction_id })

      const destinataryAddress = action.data.memo.split(':')[1]
      const quantity = action.data.quantity.split(' ')[0]

      if (!destinataryAddress) {
        console.log('No destinatary address found')
        return
      }

      await sendFunds(
        destinataryAddress,
        ethers.utils.parseUnits(quantity, 18).toString()
      )
    } catch (error: any) {
      console.error(`error to sync ${action.action}: ${error.message}`)
    }
  }
}
