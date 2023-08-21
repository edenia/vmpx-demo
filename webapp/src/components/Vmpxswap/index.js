import React, { useEffect, useState } from 'react'
import { Button, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import Box from '@mui/material/Box'
import { ethers } from 'ethers'

import { useSharedState } from '../../context/state.context'
import { getEthAddressByAccount, sleep } from '../../utils'
import {
  linkAccounts as createLinkTrx,
  logout as walletLogout
} from '../../context/LibreClient'

import styles from './styles'

const useStyles = makeStyles(styles)

const Vmpxswap = () => {
  const [state, { setState, login, logout, showMessage }] = useSharedState()
  const classes = useStyles()

  const [accountAddress, setAccountAddress] = useState('')
  const [areAccountsLinked, setAccountsLinked] = useState(true)

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        showMessage({
          type: 'warning',
          content: 'Make sure you have MetaMask installed!'
        })
        return
      }
      const provider = new ethers.BrowserProvider(ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      setState({ param: 'ethAccountAddress', ethAccountAddress: address })
      setAccountAddress(address)
    } catch (error) {
      if (error.message.includes('User rejected the request')) {
        console.log(
          'Por favor, aprueba la solicitud de MetaMask para continuar.'
        )
      } else {
        console.error(error)
      }
    }
  }

  const connectMetaMask = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        showMessage({
          type: 'warning',
          content: 'Make sure you have MetaMask installed!'
        })

        return
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      })

      showMessage({
        type: 'success',
        content: `Connected to address: ${accounts[0]}`
      })
      setAccountAddress(accounts[0])
    } catch (error) {
      showMessage({
        type: 'error',
        content: error
      })
      console.log({ error })
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
    showMessage({
      type: 'success',
      content: 'Accounts linked'
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
    }
  }, [accountAddress, state?.user?.actor])

  return (
    <Box
      bgcolor="secondary.main"
      border="1px solid #000"
      borderRadius={2}
      maxWidth="552px"
      width="100%"
      padding={3}
    >
      <Typography textAlign="center" variant="h5" color="white">
        VMPXswap.com
      </Typography>
      <Typography mt={6} textAlign="center" variant="body1" color="white">
        This app allows bridging to Libre and swappin to bVMPX (wrapped VMPX on
        bitcoin). You can use libredex.org to move bVMPX to unisat (and back).
      </Typography>
      <Box
        mt={6}
        display="flex"
        flexDirection="column"
        paddingX={accountAddress ? 4 : 18}
      >
        <Button
          onClick={() => connectMetaMask()}
          className={classes.buttonColor}
          variant="contained"
        >
          {accountAddress || 'Connect Metamask'}
        </Button>
        <br />
        <Button
          className={classes.buttonColor}
          onClick={() => connectLibre()}
          variant="contained"
        >
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
          <Typography mt={6} textAlign="center" variant="body1" color="red">
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
