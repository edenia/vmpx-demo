import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import Box from '@mui/material/Box'
import { makeStyles } from '@mui/styles'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import { Button, Typography, OutlinedInput, Link } from '@mui/material'
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined'

import { getBalance, getVMPXPoolFee, sleep } from '../../utils'
import { useSharedState } from '../../context/state.context'
import { trade, pegoutEth } from '../../context/LibreClient'
import { artifacContract } from '../../artifact'
import { blockchainConfig } from '../../config'

import styles from './styles'

const useStyles = makeStyles(styles)

const SwapComponent = () => {
  const classes = useStyles()
  const [fee, setFee] = useState()
  const [balances, setBalances] = useState([
    { balance: '0 EVMPX' },
    { balance: '0 BVMPX' }
  ])
  const [state, { showMessage }] = useSharedState()
  const [amountSendEth, setAmountSendEth] = useState(0)
  const [loadingRecieve, setLoadingRecieve] = useState(false)
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
    if (value?.split('.')[1] && value?.split('.')[1].length > 9)
      value = String(Number(value).toFixed(9))

    if (firstToken.symbol === 'eVMPX') {
      setFirstToken({ ...firstToken, amount: value })
      setSecondToken({
        ...secondToken,
        amount:
          String(value * fee)?.split('.')[1] &&
          String(value * fee)?.split('.')[1].length > 9
            ? String(Number(value * fee).toFixed(9))
            : value * fee
      })
    } else {
      setFirstToken({ ...firstToken, amount: value })
      setSecondToken({
        ...secondToken,
        amount:
          String(value * fee)?.split('.')[1] &&
          String(value * fee)?.split('.')[1].length > 9
            ? String(Number(value * fee).toFixed(9))
            : value * fee
      })
    }
  }

  const handleSetbvmpx = value => {
    if (value?.split('.')[1] && value?.split('.')[1].length > 9)
      value = String(Number(value).toFixed(9))

    if (secondToken.symbol === 'bVMPX') {
      setSecondToken({ ...secondToken, amount: value })
      setFirstToken({
        ...firstToken,
        amount:
          String(value / fee)?.split('.')[1] &&
          String(value / fee)?.split('.')[1].length > 9
            ? String(Number(value / fee).toFixed(9))
            : value / fee
      })
    } else {
      setSecondToken({ ...secondToken, amount: value })
      setFirstToken({
        ...firstToken,
        amount:
          String(value / fee)?.split('.')[1] &&
          String(value / fee)?.split('.')[1].length > 9
            ? String(Number(value / fee).toFixed(9))
            : value / fee
      })
    }
  }

  const formatAmountSymbol = value => {
    return value.replace('EVMPX', 'eVMPX').replace('BVMPX', 'bVMPX')
  }

  const sendTransaction = async () => {
    try {
      const { ethereum } = window
      const provider = new ethers.BrowserProvider(ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        blockchainConfig.contractAddressEth,
        artifacContract.abi,
        signer
      )

      if (contract) {
        const tx = await contract.transfer(
          blockchainConfig.targetWalletAddress,
          ethers.parseUnits(
            String(Number(amountReceiveEth).toFixed(9)).toString(),
            18
          )
        )

        setLoadingRecieve(true)

        const response = await tx.wait()

        setLoadingRecieve(false)
        showMessage({
          type: 'success',
          content: (
            <Typography>
              Success transaction{' '}
              <Link
                target="_blank"
                underline="none"
                href={`${blockchainConfig.ethBlockExplorer}${response.hash}`}
              >
                {response.hash}
              </Link>
            </Typography>
          )
        })
      }

      await sleep(2000) // wait for 3 seconds
      clearFields()
      await loadBalances()
    } catch (error) {
      showMessage({ type: 'error', content: error })
      console.error('Error: ', error)
    }
  }

  const sendTokensToEth = async () => {
    try {
      if (amountSendEth <= 0) {
        showMessage({
          type: 'warning',
          content: 'Amount must be greater than 0'
        })

        return
      }

      const response = await pegoutEth({
        account: state.user.actor,
        session: state.user.session,
        quantity: `${Number(amountSendEth).toFixed(9)} EVMPX`
      })

      await sleep(1000) // wait for 3 seconds
      showMessage({
        type: 'success',
        content: (
          <Typography>
            Success transaction{' '}
            <Link
              target="_blank"
              underline="none"
              href={`${blockchainConfig.libreBlockEplorer}${response.transactionId}`}
            >
              {response.transactionId}
            </Link>
          </Typography>
        )
      })
      clearFields()
      await loadBalances()
    } catch (error) {
      showMessage({ type: 'error', content: error })
    }
  }

  const handleTrate = async () => {
    try {
      const tokenFrom = firstToken.symbol
      const response = await trade({
        account: state.user.actor,
        session: state.user.session,
        contractAccount:
          tokenFrom === 'eVMPX'
            ? blockchainConfig.evmpxContract
            : blockchainConfig.bvmpxContract,
        minExpectedAmount: `${Number(secondToken.amount).toFixed(
          9
        )} ${secondToken.symbol.toUpperCase()}`,
        quantity: `${Number(firstToken.amount).toFixed(
          9
        )} ${tokenFrom.toUpperCase()}`
      })

      await sleep(1000) // wait for 3 seconds
      showMessage({
        type: 'success',
        content: (
          <Typography>
            Success transaction{' '}
            <Link
              target="_blank"
              underline="none"
              href={`${blockchainConfig.libreBlockEplorer}${response.transactionId}`}
            >
              {response.transactionId}
            </Link>
          </Typography>
        )
      })
      clearFields()
      await loadBalances()
    } catch (error) {
      showMessage({ type: 'error', content: error })
    }
  }

  const loadBalances = async () => {
    const evmpxBalance = await getBalance(state.user.actor, 'EVMPX')
    const bvmpxBalance = await getBalance(state.user.actor, 'BVMPX')

    if (evmpxBalance.length === 0 && bvmpxBalance.length === 0) return

    if (evmpxBalance.length > 0 && bvmpxBalance.length > 0)
      setBalances([...evmpxBalance, ...bvmpxBalance])
    else if (bvmpxBalance.length > 0)
      setBalances([...bvmpxBalance, { balance: '0 EVMPX' }])
    else setBalances([...evmpxBalance, { balance: '0 BVMPX' }])
  }

  const clearFields = () => {
    setAmountSendEth(0)
    setAmountReceiveEth(0)
    setFirstToken({ amount: 0, symbol: 'eVMPX' })
    setSecondToken({ amount: 0, symbol: 'bVMPX' })
  }

  useEffect(async () => {
    const feeResponse = await getVMPXPoolFee()
    await loadBalances()
    setFee(1 - feeResponse.fee / 100)
  }, [state.user.actor])

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
            <Box display="flex" key={item?.balance}>
              <Typography variant="body2" minWidth={110} align="left">
                {formatAmountSymbol(item?.balance)}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box>
          <Typography variant="body1">{state?.user?.actor}</Typography>
          <Typography variant="body1">
            {`${state?.ethAccountAddress?.substring(
              0,
              5
            )}...${state?.ethAccountAddress?.substring(
              state?.ethAccountAddress?.length - 4,
              state?.ethAccountAddress?.length
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
                  {secondToken?.symbol}
                </InputAdornment>
              }
            />
          </Box>
        </Box>
        <Button variant="outlined" onClick={handleTrate}>
          Swap
        </Button>
      </Box>
      <Box mt={8} display="flex" justifyContent="space-between">
        <Box display="flex" flexDirection="column" mr={12}>
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

              setAmountReceiveEth(
                String(value).split('.')[1] &&
                  String(value).split('.')[1].length > 9
                  ? String(Number(value).toFixed(9))
                  : value
              )
            }}
            endAdornment={<InputAdornment position="end">eVMPX</InputAdornment>}
          />
          <Button
            variant="outlined"
            onClick={sendTransaction}
            className={classes.buttonStyle}
          >
            Receive from ETH {loadingRecieve && <CircularProgress size={18} />}
          </Button>
        </Box>
        <br />
        <Box display="flex" flexDirection="column">
          <OutlinedInput
            className={classes.textFieldStyles}
            id="outlined-adornment-weight"
            value={amountSendEth}
            type="number"
            onChange={e => {
              let value = e.target.value

              if (value < 0) {
                value = 0
              }

              setAmountSendEth(
                String(value).split('.')[1] &&
                  String(value).split('.')[1].length > 9
                  ? String(Number(value).toFixed(9))
                  : value
              )
            }}
            endAdornment={<InputAdornment position="end">eVMPX</InputAdornment>}
          />
          <Button onClick={sendTokensToEth} variant="outlined">
            Send to ETH
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default SwapComponent
