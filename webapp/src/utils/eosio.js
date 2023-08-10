import { eosApi } from './eosapi'
import {
  swapVmpxContract,
  vmpxContract,
  tokenLikerContract
} from '../config/blockchain.config'

export const getBalances = async account => {
  const { rows } = await eosApi.getTableRows({
    code: swapVmpxContract,
    scope: account,
    table: 'swapacnts',
    json: true,
    limit: 2
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

  return rows[0]
}

export const getEthAddressByAccount = async ({ account }) => {
  const { rows } = await eosApi.getTableRows({
    code: tokenLikerContract,
    scope: tokenLikerContract,
    table: 'account',
    lower_bound: account,
    upper_bound: account,
    json: true,
    limit: 1
  })

  if (!rows.length) {
    throw new Error('Account does not have any eth address linked')
  }

  return rows[0]
}
