import React, { useEffect } from 'react'
import Box from '@mui/material/Box'
import { makeStyles } from '@mui/styles'
import { Button, Link, Typography } from '@mui/material'

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
      const ethereum = window.ethereum || window.web3.currentProvider

      // Verificar si es un dispositivo móvil y MetaMask no está detectado
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (isMobile && !ethereum) {
        // Intentar redirigir si es un dispositivo móvil
        window.location.href = 'metamask:'
        return
      }

      if (!ethereum) {
        showMessage({
          type: 'warning',
          content: 'Make sure you have MetaMask installed!'
        })
        return
      }

      // Continuar con la conexión si ethereum está disponible
      await setSpecificChainMetaMask(ethereum)

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
      const ethereum = window.ethereum || window.web3.currentProvider

      // Verificar si es un dispositivo móvil y MetaMask no está detectado
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (isMobile && !ethereum) {
        showMessage({
          type: 'warning',
          content: 'Make sure you have MetaMask installed!'
        })
        return
      }

      if (!ethereum) {
        // Intentar usar MetaMask URI en dispositivos móviles
        if (isMobile) {
          window.location.href = 'metamask:'
          return
        } else {
          showMessage({
            type: 'warning',
            content: 'Make sure you have MetaMask installed!'
          })
          return
        }
      }

      await setSpecificChainMetaMask(ethereum)

      const accounts = await ethereum.enable()
      const account = accounts[0]

      setState({ param: 'ethAccountAddress', ethAccountAddress: account })
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
