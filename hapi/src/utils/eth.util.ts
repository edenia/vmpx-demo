import { ethers } from 'ethers'
import { ethConfig } from '../config'

export const signEthTx = async (
  unsignedTrx: ethers.PopulatedTransaction
): Promise<string> => {
  return await ethConfig.wallet.signTransaction(unsignedTrx)
}
