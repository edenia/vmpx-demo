import { eosConfig } from '../../../config'
import payerService from '../../payer'

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

      await payerService.pegout({
        ethAddress: destinataryAddress,
        quantity
      })
    } catch (error: any) {
      console.error(`error to sync ${action.action}: ${error.message}`)
    }
  }
}
