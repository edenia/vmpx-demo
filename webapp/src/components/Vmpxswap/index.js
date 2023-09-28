import React, { useEffect } from 'react'
import Box from '@mui/material/Box'
import { makeStyles } from '@mui/styles'
import { MetaMaskSDK } from '@metamask/sdk'
import { Button, Link, Typography } from '@mui/material'

import { sleep } from '../../utils'
import { blockchainConfig } from '../../config'
import { useSharedState } from '../../context/state.context'
import { logout as walletLogout } from '../../utils/LibreClient'

import styles from './styles'

const useStyles = makeStyles(styles)

const Vmpxswap = () => {
  const [state, { setState, login, logout, showMessage }] = useSharedState()
  const classes = useStyles()

  const setSpecificChainMetaMask = async ethereum => {
    const chainId = blockchainConfig.ethChainId

    if (ethereum.chainId !== chainId) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }]
        })
      } catch (err) {
        if (err.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: blockchainConfig.ethChainName,
                chainId,
                nativeCurrency: blockchainConfig.ethChainNativeCurrency,
                rpcUrls: blockchainConfig.ethChainRpcUrls
              }
            ]
          })
        }
        console.log({ err })
      }
    }
  }

  const connectMetaMask = async () => {
    try {
      let ethereum = window.ethereum
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

      if (!ethereum) {
        if (isMobile) {
          try {
            const MMSDK = new MetaMaskSDK({
              useDeeplink: false,
              communicationLayerPreference: 'socket'
            })

            await sleep(1000)
            ethereum = MMSDK.getProvider()
          } catch (error) {
            console.error(error)
          }
        } else {
          showMessage({
            type: 'warning',
            content: 'Make sure you have MetaMask installed!'
          })
        }
      }

      if (!isMobile) await setSpecificChainMetaMask(ethereum)

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
        params: []
      })

      setState({ param: 'ethAccountAddress', ethAccountAddress: accounts[0] })
    } catch (error) {
      if (error.code === 4001) {
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
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

      if (isMobile) return

      const ethereum = window.ethereum

      if (ethereum) {
        await setSpecificChainMetaMask(ethereum)

        const accounts = await ethereum.request({
          method: 'eth_requestAccounts'
        })
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
      className={classes.centerContainer}
      bgcolor="secondary.main"
      border="1px solid #000"
      borderRadius={2}
      maxWidth="552px"
      width="100%"
    >
      <Typography textAlign="center" variant="h5" color="white">
        VMPXswap.com
      </Typography>
      <Typography mt={6} textAlign="center" variant="body1" color="white">
        This app allows bridging to Libre and swapping to bVMPX (wrapped VMPX on
        bitcoin). You can use libredex.org to move bVMPX to unisat (and back).
      </Typography>
      <Typography mt={3} textAlign="center" variant="body1" color="white">
        Before starting you must know this{' '}
        <Link
          href="https://gist.github.com/leisterfrancisco/307a93fcb3eb10c6dc24e62c42c33aae"
          underline="none"
          target="_blank"
        >
          information
        </Link>
        .
      </Typography>
      <Box
        mt={6}
        display="flex"
        flexDirection="column"
        className={classes.boxButtonPadding}
      >
        <Button
          variant="contained"
          className={classes.buttonColor}
          onClick={() => connectMetaMask()}
        >
          {state?.ethAccountAddress || 'Connect Metamask'}
        </Button>
        <br />
        <Button
          variant="contained"
          onClick={() => connectLibre()}
          className={classes.buttonColor}
        >
          {state?.user?.actor || 'Connect Libre'}
        </Button>
      </Box>
    </Box>
  )
}

export default Vmpxswap
