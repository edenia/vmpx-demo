import { BigNumber } from 'ethers'

import { eosConfig } from '../../../../config'
import payerService from '../../../payer'
import { actionModel, queueModel } from '../../../../models'
import { parserUtil, formatterUtil } from '../../../../utils'

export default {
  type: `${eosConfig.dispenserContract}:withdraw`,
  apply: async (action: actionModel.HyperionAction) => {
    try {
      if (!action.data.eth_address) {
        return
      }

      const destinataryAddress = action.data.eth_address
      const quantity = formatterUtil.formatLibreVmpxToEthVmpx(
        action.data.quantity
      )

      if (!destinataryAddress) {
        console.log('No destinatary address found')
        return
      }

      const transferData = {
        ethAddress: destinataryAddress,
        quantity: BigNumber.from(quantity)
      }
      const queue = parserUtil.fromLibreToQueue(action, transferData)

      if (BigNumber.from(quantity) <= BigNumber.from(0)) {
        console.log(`Skipping 0 balance transaction: ${queue.tx_hash}`)
        return
      }

      await queueModel.queries.save(queue)
      await payerService.pegout(action, transferData)
    } catch (error: any) {
      console.error(`error to sync ${action.action}: ${error.message}`)
    }
  }
}
