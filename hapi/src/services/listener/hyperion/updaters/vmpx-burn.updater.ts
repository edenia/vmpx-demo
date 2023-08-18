import { eosConfig } from '../../../../config'
import payerService from '../../../payer'
import { actionModel, queueModel } from '../../../../models'
import { parserUtil } from '../../../../utils'

export default {
  type: `${eosConfig.vmpxContract}:burn`,
  apply: async (action: actionModel.HyperionAction) => {
    try {
      if (!action.data.memo) {
        return
      }

      const destinataryAddress = action.data.memo.split(':')[1]
      const quantity = action.data.quantity.split(' ')[0]

      if (!destinataryAddress) {
        console.log('No destinatary address found')
        return
      }

      const transferData = { ethAddress: destinataryAddress, quantity }
      const queue = parserUtil.fromLibreToQueue(action, transferData)
      await queueModel.queries.save(queue) // store to db

      await payerService.pegout(action, transferData)
    } catch (error: any) {
      console.error(`error to sync ${action.action}: ${error.message}`)
    }
  }
}
