import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import Box from '@mui/material/Box'
import { makeStyles } from '@mui/styles'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import { Button, Typography, OutlinedInput, Link } from '@mui/material'

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
  const [state, { showMessage }] = useSharedState()
  const [amountSendEth, setAmountSendEth] = useState(0)
  const [loadingRecieve, setLoadingRecieve] = useState(false)
  const [amountReceiveEth, setAmountReceiveEth] = useState(0)
  const [firstToken, setFirstToken] = useState({
    amount: 0,
    symbol: 'eVMPX',
    balance: '0 EVMPX',
    icon: '/icons/vmpx-icon.svg'
  })
  const [secondToken, setSecondToken] = useState({
    amount: 0,
    symbol: 'bVMPX',
    balance: '0 BVMPX',
    icon: '/icons/bitcoin-icon.svg'
  })

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
            <Typography color="white">
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
          <Typography color="white">
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
          <Typography color="white">
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

    if (evmpxBalance.length > 0 && bvmpxBalance.length > 0) {
      if (firstToken.symbol.includes('eVMPX')) {
        setFirstToken({ ...firstToken, balance: evmpxBalance[0].balance })
        setSecondToken({ ...secondToken, balance: bvmpxBalance[0].balance })
      } else {
        setFirstToken({ ...firstToken, balance: bvmpxBalance[0].balance })
        setSecondToken({ ...secondToken, balance: evmpxBalance.balance })
      }
    } else if (bvmpxBalance.length > 0) {
      if (firstToken.symbol.includes('eVMPX')) {
        setSecondToken({ ...secondToken, balance: bvmpxBalance[0].balance })
      } else {
        setFirstToken({ ...firstToken, balance: bvmpxBalance[0].balance })
      }
    }
    // setBalances([...bvmpxBalance, { balance: '0 EVMPX' }])
    else {
      if (firstToken.symbol.includes('eVMPX')) {
        setFirstToken({ ...firstToken, balance: evmpxBalance[0].balance })
      } else {
        setSecondToken({ ...secondToken, balance: evmpxBalance[0].balance })
      }
      // setBalances([...evmpxBalance, { balance: '0 BVMPX' }])}
    }
  }

  const clearFields = async () => {
    setAmountSendEth(0)
    setAmountReceiveEth(0)
    setFirstToken({ amount: 0, symbol: 'eVMPX' })
    setSecondToken({ amount: 0, symbol: 'bVMPX' })
    await loadBalances()
  }

  useEffect(async () => {
    const feeResponse = await getVMPXPoolFee()
    await loadBalances()
    setFee(1 - feeResponse.fee / 100)
  }, [state.user.actor])

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      flexDirection="column"
    >
      <Box
        width="100%"
        height="96px"
        display="flex"
        padding="0 104px"
        alignItems="center"
        bgcolor="secondary.main"
        justifyContent="space-between"
      >
        <Typography variant="h5">VMPX - ETH / BTC Swap</Typography>
        <Box>
          <Typography color="white" variant="body1">
            {state?.user?.actor}
          </Typography>
          <Typography color="white" variant="body1">
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
      <Box height="100%" display="flex" alignItems="center">
        <Box
          bgcolor="secondary.main"
          border="1px solid #000"
          borderRadius={2}
          maxWidth="536px"
          width="100%"
          height={570}
          padding={3}
        >
          <Box textAlign="center">
            <Typography variant="h4" mb={1}>
              Swap
            </Typography>
            <Typography variant="body1">
              This app allows bridging to Libre and swappin to bVMPX
            </Typography>
          </Box>
          <Box
            justifyContent="center"
            flexDirection="column"
            display="flex"
            mt={2}
          >
            <Box
              mb={1}
              width="100%"
              display="flex"
              alignItems="end"
              justifyContent="center"
              flexDirection="column"
            >
              <Box width="100%" mb={2}>
                <Typography ml={1} variant="body1">
                  Swap from
                </Typography>
                <OutlinedInput
                  className={classes.textFieldSwapStyles}
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
                      <img src={firstToken.icon} />
                      <Typography variant="body1" color="white" ml={1}>
                        {firstToken.symbol}
                      </Typography>
                    </InputAdornment>
                  }
                  fullWidth
                />
                <Typography ml={2} variant="caption" color="#8A92B2">
                  {`Balance: ${formatAmountSymbol(firstToken.balance)}`}
                </Typography>
              </Box>
              <img
                src="/icons/flip-icon.svg"
                onClick={() => handleFlip()}
                className={classes.flipStyle}
              />
              {/* <ChangeCircleOutlinedIcon
                fontSize="large"
                onClick={() => handleFlip()}
                className={classes.flipStyle}
              /> */}
              <Box marginY={2} width="100%">
                <Typography ml={1} variant="body1">
                  Swap to
                </Typography>
                <OutlinedInput
                  className={classes.textFieldSwapStyles}
                  id="outlined-adornment-weight"
                  value={secondToken.amount}
                  type="number"
                  fullWidth
                  onChange={e => {
                    let value = e.target.value

                    if (value < 0) {
                      value = 0
                    }

                    handleSetbvmpx(value)
                  }}
                  endAdornment={
                    <InputAdornment position="end">
                      <img src={secondToken.icon} />
                      <Typography variant="body1" color="white" ml={1}>
                        {secondToken?.symbol}
                      </Typography>
                    </InputAdornment>
                  }
                />
                <Typography ml={2} variant="caption" color="#8A92B2">
                  {`Balance: ${formatAmountSymbol(secondToken.balance)}`}
                </Typography>
              </Box>
            </Box>
            <Button
              className={classes.buttonColor}
              onClick={handleTrate}
              variant="contained"
              fullWidth
            >
              Swap
            </Button>
          </Box>
          <Box mt={5} display="flex" justifyContent="space-between">
            <Box display="flex" flexDirection="column" mr={5}>
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
                endAdornment={
                  <InputAdornment position="end">eVMPX</InputAdornment>
                }
              />
              <Button
                variant="contained"
                onClick={sendTransaction}
                className={classes.buttonStyle}
              >
                Receive from ETH{' '}
                {loadingRecieve && <CircularProgress size={18} />}
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
                endAdornment={
                  <InputAdornment position="end">eVMPX</InputAdornment>
                }
              />
              <Button
                variant="contained"
                onClick={sendTokensToEth}
                className={classes.buttonStyle}
              >
                Send to ETH
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default SwapComponent
