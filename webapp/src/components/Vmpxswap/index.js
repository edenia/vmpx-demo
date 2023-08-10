import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { Button, Typography } from '@mui/material'
import { ethers } from 'ethers'

import { useSharedState } from '../../context/state.context'
import { getEthAddressByAccount } from '../../utils'
import { linkAccounts } from '../../context/LibreClient'

const Vmpxswap = () => {
  const [state, { setState, login }] = useSharedState()

  const [accountAddress, setAccountAddress] = useState('')
  const [areAccountsLinked, setAccountsLinked] = useState(false)

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

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      })

      setAccountAddress(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const connectLibre = async () => {
    await login()
  }

  const checkMatch = async () => {
    const { account: libreAccount, eth_address: ethAddress } =
      await getEthAddressByAccount(state?.user?.actor)

    const areLinked =
      libreAccount === state?.user?.actor && ethAddress === accountAddress

    console.log({ areLinked })

    setAccountsLinked(areLinked)
    setState({ param: 'accountMatch', accountMatch: areLinked })
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  useEffect(() => {
    if (accountAddress && state?.user?.actor) {
      setState({ param: 'connectMeta', connectMeta: true })
      setState({ param: 'connectLibre', connectLibre: true })

      checkMatch()

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
          <Button
            variant="outlined"
            onClick={() =>
              linkAccounts({
                session: state?.user?.session,
                libreAccount: state?.user?.actor,
                address: accountAddress
              })
            }
          >
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
