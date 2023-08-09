import LibreLinkBrowserTransport from '@libre-chain/libre-link-browser-transport'
import LibreLink from '@libre-chain/libre-link'
import moment from 'moment'

import { swapVmpxContract, vmpxContract } from '../config/blockchain.config'

export const loginLibre = async () => {
  try {
    const link = new LibreLink({
      transport: new LibreLinkBrowserTransport(),
      chains: [
        {
          chainId:
            'b64646740308df2ee06c6b72f34c0f7fa066d940e831f752db2006fcc2b78dee',
          nodeUrl: 'https://testnet.libre.org'
        }
      ],
      scheme: 'libre'
    })

    const identity = await link.login(
      String(process.env.NEXT_PUBLIC_LIBRE_APP_NAME)
    )
    // let session = identity.session
    localStorage.setItem(
      'dapp-user-auth',
      JSON.stringify({
        actor: identity.session.auth.actor.toString(),
        permission: identity.session.auth.permission.toString(),
        expiration: moment().add(20, 'minutes'),
        type: 'libre'
      })
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

const logout = async (link, session, chainId) => {
  if (!link || !session) return localStorage.removeItem('dapp-user-auth')
  await link.removeSession(
    String(process.env.NEXT_PUBLIC_LIBRE_APP_NAME),
    session.auth,
    chainId
  )
  session = null
  localStorage.removeItem('dapp-user-auth')
}

export const restoreSession = async (hyperionUrl, chainId, link, session) => {
  try {
    if (!link)
      throw new Error('An error has occurred while restoring a session')

    let userAuth = localStorage.getItem('dapp-user-auth')

    if (userAuth) {
      userAuth = JSON.parse(userAuth)
      // LOGOUT USER IF CONNECTION HAS EXPIRED
      if (moment().isAfter(userAuth.expiration)) {
        await logout()
        return {
          user: null,
          error: ''
        }
      }
      link = new LibreLink({
        transport: new LibreLinkBrowserTransport(),
        chains: [
          {
            chainId: String(chainId),
            nodeUrl: String(hyperionUrl)
          }
        ],
        scheme: 'libre'
      })

      session = await link.restoreSession(
        String(process.env.NEXT_PUBLIC_LIBRE_APP_NAME),
        userAuth,
        chainId
      )
    }

    if (!session)
      throw new Error('An error has occurred while restoring a session')

    return {
      user: {
        actor: session.auth.actor.toString(),
        permission: session.auth.permission.toString()
      },
      error: ''
    }
  } catch (e) {
    return {
      user: null,
      error: e.message || 'An error has occurred while restoring a session'
    }
  }
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
  console.log({
    minExpectedAmount,
    contractAccount,
    quantity,
    account,
    session
  })

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
