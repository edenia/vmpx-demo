import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { Button, Typography } from '@mui/material'
import { ethers } from 'ethers'

import { useSharedState } from '../../context/state.context'
import { getEthAddressByAccount, sleep } from '../../utils'
import {
  linkAccounts as createLinkTrx,
  logout as walletLogout
} from '../../context/LibreClient'

const Vmpxswap = () => {
  const [state, { setState, login, logout }] = useSharedState()

  const [accountAddress, setAccountAddress] = useState('')
  const [areAccountsLinked, setAccountsLinked] = useState(true)

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Make sure you have MetaMask installed!')
        return
      }

      const provider = new ethers.BrowserProvider(ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      setState({ param: 'ethAccountAddress', ethAccountAddress: address })

      setAccountAddress(address)
    } catch (error) {
      console.log(error)
    }
  }

  const connectMetaMask = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        window.alert('Get MetaMask!')
        return
      }

      console.log('conecting from metamask...')
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      })

      console.log(`connected to address: ${accounts[0]}`)

      setAccountAddress(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const connectLibre = async () => {
    if (!state?.user) {
      await login()
    } else {
      await walletLogout(state.user.session)
      logout()
    }
  }

  const checkMatch = async (account, addressEth) => {
    const { account: accLibre, eth_address: accAddress } =
      await getEthAddressByAccount(account)

    const areLinked = accLibre === account && accAddress === addressEth

    setAccountsLinked(areLinked)
    setState({ param: 'accountMatch', accountMatch: areLinked })
  }

  const linkAccounts = async () => {
    await createLinkTrx({
      session: state?.user?.session,
      libreAccount: state?.user?.actor,
      address: accountAddress
    })
    await sleep(2000) // wait for 2 seconds
    await checkMatch(state?.user?.actor, accountAddress)
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  useEffect(() => {
    if (accountAddress && state?.user?.actor) {
      setState({ param: 'connectMeta', connectMeta: true })
      setState({ param: 'connectLibre', connectLibre: true })

      checkMatch(state?.user?.actor, accountAddress)

      // if (state?.user?.actor && !state?.accountMatch) {
      //   setAccountsLinked(true)
      //   setState({ param: 'accountMatch', accountMatch: true })
      // }
      // setState({ param: 'user', user: 'Boomer' })
    }
  }, [accountAddress, state?.user?.actor])

  return (
    <Box
      border="1px solid rgb(222, 222, 226)"
      bgcolor="white"
      borderRadius={2}
      maxWidth="552px"
      width="100%"
      padding={3}
    >
      <Typography textAlign="center" variant="h5">
        VMPXswap.com
      </Typography>
      <Typography mt={6} textAlign="center" variant="body1">
        This app allows bridging to Libre and swappin to bVMPX (wrapped VMPX on
        bitcoin). You can use libredex.org to move bVMPX to unisat (and back).
      </Typography>
      <Box
        mt={6}
        display="flex"
        flexDirection="column"
        paddingX={accountAddress ? 4 : 18}
      >
        <Button variant="outlined" onClick={() => connectMetaMask()}>
          {accountAddress || 'Connect Metamask'}
        </Button>
        <br />
        <Button variant="outlined" onClick={() => connectLibre()}>
          {state?.user?.actor || 'Connect Libre'}
        </Button>
      </Box>

      {accountAddress && state?.user?.actor && !areAccountsLinked ? (
        <Box
          mt={6}
          display="flex"
          flexDirection="column"
          paddingX={accountAddress ? 4 : 18}
        >
          <Typography
            mt={6}
            textAlign="center"
            variant="body1"
            style={{ color: 'red' }}
          >
            Libre account and Ethereum account are not linked
          </Typography>
          <Button variant="outlined" onClick={linkAccounts}>
            {'Link accounts'}
          </Button>
        </Box>
      ) : (
        <> </>
      )}
    </Box>
  )
}

export default Vmpxswap
