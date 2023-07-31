// import { isAddress } from 'web3-validator'

// import { transferModel } from '../../../models'

// TODO: handle this as a network function, for example, base on the
// network config, the action type and logic will be different

export default {
  type: `vmpx:retire`,
  apply: async (action: any) => {
    // if (!isAddress(action.data.memo)) {
    //   return
    // }

    try {
      // await transferModel.queries.save({
      //   block: action.block,
      //   transaction_id: action.transaction_id,
      //   timestamp: action.timestamp,
      //   from: action.data.from,
      //   to: action.data.to,
      //   amount: action.data.amount,
      //   symbol: action.data.symbol,
      //   memo: action.data.memo,
      //   quantity: action.data.quantity,
      //   type: transferModel.interfaces.Type.incoming
      // })

      console.log(`Returning funds`)
      console.dir(action, { depth: null })
    } catch (error: any) {
      console.error(`error to sync ${action.action}: ${error.message}`)
    }
  }
}
