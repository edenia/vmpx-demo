// import LibreLinkBrowserTransport from '@libre-chain/libre-link-browser-transport'
// import LibreLink from '@libre-chain/libre-link'
import AnchorLink from 'anchor-link'
import AnchorLinkBrowserTransport from 'anchor-link-browser-transport'
// import moment from 'moment'

import {
  swapVmpxContract,
  vmpxContract,
  tokenLikerContract
} from '../config/blockchain.config'

const link = new AnchorLink({
  transport: new AnchorLinkBrowserTransport(),
  chains: [
    {
      chainId:
        'b64646740308df2ee06c6b72f34c0f7fa066d940e831f752db2006fcc2b78dee',
      nodeUrl: 'https://api.testnet.libre.cryptobloks.io'
    }
  ],
  scheme: 'libre'
})

export const loginLibre = async () => {
  try {
    const identity = await link.login(
      String(process.env.NEXT_PUBLIC_LIBRE_APP_NAME)
    )

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
  console.log({ session })
  await link.removeSession(
    String(process.env.NEXT_PUBLIC_LIBRE_APP_NAME),
    session.auth,
    'b64646740308df2ee06c6b72f34c0f7fa066d940e831f752db2006fcc2b78dee'
  )
}

export const restoreSession = async () => {
  const restoredSession = await link.restoreSession(
    String(process.env.NEXT_PUBLIC_LIBRE_APP_NAME)
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
  const authorization = [
    {
      actor: account,
      permission: 'active'
    }
  ]

  const actions = [
    {
      authorization,
      account: contractAccount, // 'bvmpx' | 'evmpx',  bvmpx if trade is from BVMPX to EVMPX and evmpx if trade is from EVMPX to BVMPX
      name: 'transfer',
      data: {
        from: account, // alice is signing this action
        to: swapVmpxContract, // this contract is only for Libre Testnet
        quantity: quantity, // '1.000000000 BVMPX' | '1.000000000 EVMPX',
        memo: `exchange:${vmpxContract},${minExpectedAmount}, Trading ${
          quantity.split(' ')[1]
        } for ${minExpectedAmount.split(' ')[1]}`
        // 'exchange:BEVMPX, 9.000000000 EVMPX, Trading BVMPX for EVMPX' |
        // 'exchange:BEVMPX, 9.000000000 BVMPX, Trading EVMPX for BVMPX' depending on the trade type whether it is from EVMPX to BVMPX or BVMPX to EVMPX, the format is: 'LPTOKEN,min_expected_asset,optional memo'
      }
    }
  ]

  const result = await session.transact({ actions }, { broadcast: true })

  return {
    success: true,
    transactionId: result.processed.id
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
        // eth_address: DEFAULT, handled by the Smart Contract
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
      account: tokenLikerContract,
      name: 'withdraw',
      data: {
        account,
        quantity,
        eth_address: '' // DEFAULT, handled by the Smart Contract
      }
    }
  ]

  const result = await session.transact({ actions }, { broadcast: true })

  return {
    success: true,
    transactionId: result.processed.id
  }
}
