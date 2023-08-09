import React, { useEffect, useState } from 'react'
import { ethers, Contract } from 'ethers'
import Box from '@mui/material/Box'
import { makeStyles } from '@mui/styles'
import InputAdornment from '@mui/material/InputAdornment'
import { Button, Typography, OutlinedInput } from '@mui/material'
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined'

import { useSharedState } from '../../context/state.context'
import { blockchainConfig } from '../../config'
import { abiContract } from '../../artifact'
import { getBalances } from '../../utils'

import styles from './styles'

const useStyles = makeStyles(styles)

const SwapComponent = () => {
  const classes = useStyles()
  const [state] = useSharedState()
  const [balances, setBalances] = useState([])
  const [amountReceiveEth, setAmountReceiveEth] = useState(0)
  const [firstToken, setFirstToken] = useState({ amount: 0, symbol: 'eVMPX' })
  const [secondToken, setSecondToken] = useState({ amount: 0, symbol: 'bVMPX' })

  const handleFlip = () => {
    const tokenOne = firstToken
    const tokenTwo = secondToken

    setFirstToken(tokenTwo)
    setSecondToken(tokenOne)
  }

  const handleSetevmpx = value => {
    if (firstToken.symbol === 'eVMPX') {
      setFirstToken({ ...firstToken, amount: value })
      setSecondToken({ ...secondToken, amount: value * 2 })
    } else {
      setFirstToken({ ...firstToken, amount: value })
      setSecondToken({ ...secondToken, amount: value / 2 })
    }
  }

  const handleSetbvmpx = value => {
    if (secondToken.symbol === 'bVMPX') {
      setSecondToken({ ...secondToken, amount: value })
      setFirstToken({ ...firstToken, amount: value / 2 })
    } else {
      setSecondToken({ ...secondToken, amount: value })
      setFirstToken({ ...firstToken, amount: value * 2 })
    }
  }

  const getSymbol = value => {
    return value.includes('USDL') ? 'eVMPX' : 'bVMPX'
  }

  const getAmount = value => {
    return value.includes('USDL')
      ? value.replace('USDL', '')
      : value.replace('BTCL', '')
  }

  const sendTransaction = async () => {
    try {
      const { ethereum } = window
      const provider = new ethers.BrowserProvider(ethereum)
      // const signer = await provider.getSigner()
      console.log({
        provider,
        contractAddressEth: blockchainConfig.contractAddressEth
      })
      const contract = new Contract(
        blockchainConfig.contractAddressEth,
        [abiContract],
        provider
      )
      console.log({ contract, test: amountReceiveEth.toString() })
      if (contract) {
        console.log('Entra')
        const tx = await contract.transfer(
          '0xAF1b081600b839849e96e5f0889078D14dd1C960',
          ethers.parseUnits(amountReceiveEth.toString(), 18)
        ) // Llamada a la función del contrato
        await tx.wait() // Esperar a que se confirme la transacción
        console.log('Transacción confirmada')
      }
    } catch (error) {
      console.error('Error Test: ', error)
    }
  }

  // const handleSendTransaction = async () => {
  //   if (!state.ethAccountAddress) return

  //   const { ethereum } = window

  //   if (!ethereum) {
  //     console.log('Make sure you have MetaMask installed!')
  //     return
  //   }

  //   const accounts = await ethereum.request({
  //     method: 'eth_requestAccounts'
  //   })
  //   console.log({ accounts })
  //   const provider = new ethers.BrowserProvider(ethereum)
  //   const signer = await provider.getSigner()

  //   const transaction = {
  //     to: '0xAF1b081600b839849e96e5f0889078D14dd1C960',
  //     value: ethers.parseEther(amountReceiveEth.toString())
  //   }

  //   const txResponse = await signer.sendTransaction(transaction)
  //   console.log('Transaction hash:', txResponse.hash)
  // }

  useEffect(async () => {
    const response = await getBalances('leisterfranc')
    setBalances(response)
    console.log({ response })
  }, [])

  return (
    <Box
      border="1px solid rgb(222, 222, 226)"
      borderRadius={2}
      maxWidth="552px"
      bgcolor="white"
      width="100%"
      padding={3}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body1">Balances:</Typography>
          {balances.map(item => (
            <Box display="flex" key={item.symbol}>
              <Typography variant="body2" minWidth={110} align="left">
                {getAmount(item.balance.quantity)}
              </Typography>
              <Typography variant="body2" align="left">
                {getSymbol(item.balance.quantity)}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box>
          <Typography variant="body1">{state.user.actor}</Typography>
          <Typography variant="body1">
            {`${state?.ethAccountAddress?.substring(
              0,
              5
            )}...${state?.ethAccountAddress?.substring(
              state.ethAccountAddress.length - 5,
              state.ethAccountAddress.length
            )}`}
          </Typography>
        </Box>
      </Box>
      <Box
        justifyContent="center"
        flexDirection="column"
        display="flex"
        paddingX={20}
        mt={2}
      >
        <Box
          display="flex"
          alignItems="center"
          flexDirection="column"
          justifyContent="center"
        >
          <Box display="flex" mt={2} justifyContent="center">
            <OutlinedInput
              className={classes.textFieldStyles}
              id="outlined-adornment-weight"
              value={firstToken.amount}
              type="number"
              onChange={e => {
                let value = e.target.value

                if (value < 0) {
                  value = 0
                }

                handleSetevmpx(value)
              }}
              endAdornment={
                <InputAdornment position="end">
                  {firstToken.symbol}
                </InputAdornment>
              }
            />
          </Box>
          <ChangeCircleOutlinedIcon
            fontSize="large"
            onClick={() => handleFlip()}
            className={classes.flipStyle}
          />
          <Box display="flex" mt={2} justifyContent="center">
            <OutlinedInput
              className={classes.textFieldStyles}
              id="outlined-adornment-weight"
              value={secondToken.amount}
              type="number"
              onChange={e => {
                let value = e.target.value

                if (value < 0) {
                  value = 0
                }

                handleSetbvmpx(value)
              }}
              endAdornment={
                <InputAdornment position="end">
                  {secondToken.symbol}
                </InputAdornment>
              }
            />
          </Box>
        </Box>
        <Button variant="outlined">Swap</Button>
      </Box>
      <Box mt={8} display="flex" justifyContent="space-between">
        <Box display="flex" flexDirection="column" mr={14}>
          <OutlinedInput
            className={classes.textFieldStyles}
            id="outlined-adornment-weight"
            value={amountReceiveEth}
            type="number"
            onChange={e => {
              let value = e.target.value

              if (value < 0) {
                value = 0
              }

              setAmountReceiveEth(value)
            }}
            endAdornment={<InputAdornment position="end">VMPX</InputAdornment>}
          />
          <Button onClick={sendTransaction} variant="outlined">
            Receive from ETH
          </Button>
        </Box>
        <br />
        <Box display="flex" flexDirection="column">
          <OutlinedInput
            className={classes.textFieldStyles}
            id="outlined-adornment-weight"
            value={secondToken.amount}
            type="number"
            onChange={e => {
              let value = e.target.value

              if (value < 0) {
                value = 0
              }

              handleSetbvmpx(value)
            }}
            endAdornment={<InputAdornment position="end">eVMPX</InputAdornment>}
          />
          <Button variant="outlined">Send to ETH</Button>
        </Box>
      </Box>
    </Box>
  )
}

export default SwapComponent
