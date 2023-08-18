import { eosConfig } from '../../../../config'
import payerService from '../../../payer'
import { actionModel } from '../../../../models'

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

      await payerService.pegout(action, {
        ethAddress: destinataryAddress,
        quantity
      })
    } catch (error: any) {
      console.error(`error to sync ${action.action}: ${error.message}`)
    }
  }
}
