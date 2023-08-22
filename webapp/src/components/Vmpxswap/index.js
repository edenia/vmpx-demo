import React, { useEffect } from 'react'
import { Button, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import Box from '@mui/material/Box'

import { useSharedState } from '../../context/state.context'
import { logout as walletLogout } from '../../context/LibreClient'

import styles from './styles'

const useStyles = makeStyles(styles)

const Vmpxswap = () => {
  const [state, { setState, login, logout, showMessage }] = useSharedState()
  const classes = useStyles()

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
      setState({ param: 'ethAccountAddress', ethAccountAddress: accounts[0] })
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

  const checkIfMetaMaskIsConnected = async () => {
    try {
      const ethereum = window.ethereum

      if (ethereum) {
        const accounts = await window.ethereum.enable()
        const account = accounts[0]

        setState({ param: 'ethAccountAddress', ethAccountAddress: account })
      } else {
        showMessage({
          type: 'warning',
          content: 'Make sure you have MetaMask installed!'
        })
      }
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

  const connectLibre = async () => {
    if (!state?.user) {
      await login()
    } else {
      await walletLogout(state.user.session)
      logout()
    }
  }

  useEffect(() => {
    checkIfMetaMaskIsConnected()
  }, [])

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
        paddingX={state?.ethAccountAddress ? 4 : 18}
      >
        <Button
          onClick={() => connectMetaMask()}
          className={classes.buttonColor}
          variant="contained"
        >
          {state?.ethAccountAddress || 'Connect Metamask'}
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
    </Box>
  )
}

export default Vmpxswap
