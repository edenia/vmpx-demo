// import Web3 from 'web3'

import { ethers } from 'ethers'

import artifact from '../artifact'

const alchemyApiKey = 'abc'

// address: 0xaf1b081600b839849e96e5f0889078d14dd1c960
const privateKey = 'bcd'

const targetAddress = '0xAF1b081600b839849e96e5f0889078D14dd1C960'
const contractAddress = '0xAf5c20De8FEb9d9C0980C4974a8692dE37F8b46c'

const provider = new ethers.providers.WebSocketProvider(
  `wss://eth-goerli.g.alchemy.com/v2/${alchemyApiKey}`
)

const providerRpc = new ethers.providers.JsonRpcProvider(
  `https://eth-goerli.g.alchemy.com/v2/${alchemyApiKey}`
)

const wallet = new ethers.Wallet(privateKey, providerRpc)

const listenForEvents = async () => {
  const vmpxContract = new ethers.Contract(
    contractAddress,
    artifact.contractArtifact.abi,
    provider
  )
  const filter = vmpxContract.filters.Transfer(null, targetAddress)

  // Receive an event when that filter occurs
  vmpxContract.on(filter, (from, to, amount, event) => {
    console.log('🚀 ~ vmpxContract.on ~ Transfer')
    const info = {
      from: from,
      to: to,
      value: ethers.utils.formatUnits(amount, 6),
      data: event
    }
    console.log(JSON.stringify(info, null, 4))

    // TODO: trigger the transfer of the same amount of VMPX to the sender
    // on Libre side
  })
}

const sendFunds = async () => {
  const vmpxContract = new ethers.Contract(
    contractAddress,
    artifact.contractArtifact.abi,
    wallet
  )

  const toAddress = '0xBCE66aEf2B18904bD6B1696CB2b748ae6e712322'
  const amount = ethers.utils.parseUnits('0.1', 18)
  const tx = await vmpxContract.transfer(toAddress, amount, {
    gasLimit: 100000
  })
  console.log(`Transaction hash: ${tx.hash}`)
}

// sendFunds()

export default { listenForEvents }
