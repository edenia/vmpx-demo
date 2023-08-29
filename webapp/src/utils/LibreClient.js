import AnchorLink from 'anchor-link'
import AnchorLinkBrowserTransport from 'anchor-link-browser-transport'

import {
  libreApiHost,
  libreChainId,
  evmpxContract,
  vmpxPoolContract,
  swapVmpxContract,
  tokenLikerContract
} from '../config/blockchain.config'

const link = new AnchorLink({
  transport: new AnchorLinkBrowserTransport(),
  chains: [
    {
      chainId: libreChainId,
      nodeUrl: libreApiHost
    }
  ],
  scheme: 'libre'
})

export const loginLibre = async () => {
  try {
    const identity = await link.login(String(process.env.REACT_APP_NAME))

    return {
      user: {
        actor: identity.session.auth.actor.toString(),
        permission: identity.session.auth.permission.toString(),
        session: identity.session
      },
      error: ''
    }
  } catch (e) {
    return {
      user: { actor: '', permission: '' },
      error: e.message || 'An error has occurred while logging in'
    }
  }
}

export const logout = async session => {
  await link.removeSession(
    String(process.env.REACT_APP_NAME),
    session.auth,
    libreChainId
  )
}

export const restoreSession = async () => {
  const restoredSession = await link.restoreSession(
    String(process.env.REACT_APP_NAME)
  )

  return restoredSession
    ? {
        user: {
          actor: restoredSession.auth.actor.toString(),
          permission: restoredSession.auth.permission.toString(),
          session: restoredSession
        },
        error: ''
      }
    : {}
}

export const getUsername = async ({ username, rpc }) => {
  try {
    const result = await rpc?.get_account(username)
    return result
  } catch (err) {
    console.warn(err)
    return null
  }
}

export const trade = async ({
  minExpectedAmount,
  contractAccount,
  quantity,
  account,
  session
}) => {
  try {
    const authorization = [
      {
        actor: account,
        permission: 'active'
      }
    ]

    const actions = [
      {
        authorization,
        account: contractAccount,
        name: 'transfer',
        data: {
          from: account,
          to: swapVmpxContract,
          quantity: quantity,
          memo: `exchange:${vmpxPoolContract},${minExpectedAmount}, Trading ${
            quantity.split(' ')[1]
          } for ${minExpectedAmount.split(' ')[1]}`
        }
      }
    ]

    const result = await session.transact({ actions }, { broadcast: true })

    return {
      success: true,
      transactionId: result.processed.id
    }
  } catch (error) {
    console.log({ error })
  }
}

export const linkAccounts = async ({ session, libreAccount, address }) => {
  const authorization = [
    {
      actor: libreAccount,
      permission: 'active'
    }
  ]

  const actions = [
    {
      authorization,
      account: tokenLikerContract,
      name: 'linkaddr',
      data: {
        account: libreAccount,
        eth_address: address
      }
    }
  ]

  const result = await session.transact({ actions }, { broadcast: true })

  return {
    success: true,
    transactionId: result.processed.id
  }
}

export const pegoutEth = async ({ session, account, quantity }) => {
  const authorization = [
    {
      actor: account,
      permission: 'active'
    }
  ]

  const actions = [
    {
      authorization,
      account: evmpxContract,
      name: 'burn',
      data: {
        account,
        quantity,
        memo: '' // empty field = DEFAULT, handled by the ${tokenLikerContract} Smart Contract
      }
    }
  ]

  const result = await session.transact({ actions }, { broadcast: true })

  return {
    success: true,
    transactionId: result.processed.id
  }
}
