import { eosApi } from './eosapi'
import {
  tokenLikerContract,
  swapVmpxContract,
  vmpxPoolContract,
  evmpxContract,
  bvmpxContract
} from '../config/blockchain.config'

export const getBalance = async (account, token) => {
  const { rows } = await eosApi.getTableRows({
    code: token === 'EVMPX' ? evmpxContract : bvmpxContract,
    scope: account,
    table: 'accounts',
    json: true,
    limit: 1
  })

  return rows
}

export const getVMPXPoolFee = async () => {
  const { rows } = await eosApi.getTableRows({
    code: swapVmpxContract,
    scope: vmpxPoolContract,
    table: 'stat',
    json: true
  })

  return rows[0]
}

export const getEthAddressByAccount = async account => {
  const { rows } = await eosApi.getTableRows({
    code: tokenLikerContract,
    scope: tokenLikerContract,
    table: 'account',
    lower_bound: account,
    upper_bound: account,
    json: true,
    limit: 1
  })

  return rows[0] || {}
}
