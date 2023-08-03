import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { Button, Typography } from '@mui/material'
import { ethers } from 'ethers'

import { useSharedState } from '../../context/state.context'

const Vmpxswap = () => {
  const [, { setState }] = useSharedState()

  const [accountAddress, setAccountAddress] = useState('')

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

  const connectLibre = () => {
    setState({ param: 'connectLibre', connectLibre: true })
    setState({ param: 'user', user: 'Boomer' })
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  useEffect(() => {
    if (accountAddress) {
      setState({ param: 'connectMeta', connectMeta: true })
      setState({ param: 'user', user: 'Boomer' })
    }
  }, [accountAddress])

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
          Connect Libre
        </Button>
      </Box>
    </Box>
  )
}

export default Vmpxswap
