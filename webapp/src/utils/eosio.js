import { eosApi } from './eosapi'

export const getBalances = async account => {
  console.log(account)
  const { rows } = await eosApi.getTableRows({
    code: 'swap.libre',
    scope: 'leisterfranc',
    table: 'swapacnts',
    // lower_bound: account,
    // upper_bound: account,
    json: true
    // limit: 1
  })

  return rows
}
