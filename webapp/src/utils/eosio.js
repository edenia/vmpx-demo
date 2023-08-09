import { eosApi } from './eosapi'
import { swapVmpxContract, vmpxContract } from '../config/blockchain.config'

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

export const getVMPXPoolFee = async () => {
  const { rows } = await eosApi.getTableRows({
    code: swapVmpxContract,
    scope: vmpxContract,
    table: 'stat',
    json: true
  })
  console.log({ rows })
  return rows[0]
}
