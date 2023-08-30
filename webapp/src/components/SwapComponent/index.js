import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import { makeStyles } from '@mui/styles'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import { Button, Typography, OutlinedInput, Link, Tooltip } from '@mui/material'

import { blockchainConfig } from '../../config'
import { artifacContract } from '../../artifact'
import { useSharedState } from '../../context/state.context'
import {
  trade,
  pegoutEth,
  logout as walletLogout,
  linkAccounts as createLinkTrx
} from '../../utils/LibreClient'
import {
  sleep,
  getBalance,
  getVMPXPoolFee,
  getEthAddressByAccount
} from '../../utils'

import styles from './styles'

const useStyles = makeStyles(styles)

const SwapComponent = () => {
  const classes = useStyles()
  const [fee, setFee] = useState()
  const handleClose = () => setOpen(false)
  const [areAccountsLinked, setAccountsLinked] = useState(true)
  const [state, { setState, showMessage, logout }] = useSharedState()
  const [amountSendEth, setAmountSendEth] = useState(0)
  const [loadingRecieve, setLoadingRecieve] = useState(false)
  const [amountReceiveEth, setAmountReceiveEth] = useState(0)
  const [open, setOpen] = useState(true)
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

      await setSpecificChainMetaMask(ethereum)

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      })

      setState({ param: 'ethAccountAddress', ethAccountAddress: accounts[0] })

      return accounts[0]
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

  const checkMatch = async (account, addressEth) => {
    const { account: accLibre, eth_address: accAddress } =
      await getEthAddressByAccount(account)
    const areLinked =
      accLibre?.toLowerCase() === account?.toLowerCase() &&
      accAddress?.toLowerCase() === addressEth?.toLowerCase()

    setAccountsLinked(areLinked)
    setState({ param: 'accountMatch', accountMatch: areLinked })

    return areLinked
  }

  const sendTransaction = async () => {
    try {
      if (amountReceiveEth <= 0) {
        showMessage({
          type: 'warning',
          content: 'Amount must be greater than 0'
        })

        return
      }

      const accountAddressEth = await connectMetaMask()

      if (!(await checkMatch(state?.user?.actor, accountAddressEth))) return

      const { ethereum } = window

      await setSpecificChainMetaMask(ethereum)

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

      await sleep(2000)
      clearFields()
      await loadBalances()
    } catch (error) {
      if (error.message.includes('User rejected the request')) {
        console.log('Please approve MetaMask´s request to continue.')
      } else if (error.message.includes('transfer amount exceeds balance')) {
        showMessage({
          type: 'error',
          content: 'Transfer amount exceeds available balance'
        })
      } else {
        console.error(error)
      }
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

      await sleep(1000)
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
      if (
        error.message.includes(
          'eosio_assert_message assertion failure at /v1/chain/push_transaction'
        )
      ) {
        console.log(error.message)
      } else {
        console.log(error.message)
      }
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

      await sleep(1000)

      if (!response?.transactionId) return

      showMessage({
        type: 'success',
        content: (
          <Typography color="white">
            Success transaction{' '}
            <Link
              target="_blank"
              underline="none"
              href={`${blockchainConfig.libreBlockEplorer}${response?.transactionId}`}
            >
              {response?.transactionId}
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
    const [evmpxBalance, bvmpxBalance] = await Promise.all([
      getBalance(state.user.actor, 'EVMPX'),
      getBalance(state.user.actor, 'BVMPX')
    ])

    if (evmpxBalance.length === 0 && bvmpxBalance.length === 0) return

    if (evmpxBalance.length > 0 && bvmpxBalance.length > 0) {
      if (firstToken.symbol === 'eVMPX') {
        setFirstToken({
          ...firstToken,
          balance: evmpxBalance[0].balance,
          amount: 0
        })
        setSecondToken({
          ...secondToken,
          balance: bvmpxBalance[0].balance,
          amount: 0
        })
      } else {
        setFirstToken({
          ...firstToken,
          balance: bvmpxBalance[0].balance,
          amount: 0
        })
        setSecondToken({
          ...secondToken,
          balance: evmpxBalance[0].balance,
          amount: 0
        })
      }
    } else if (bvmpxBalance.length > 0) {
      if (firstToken.symbol === 'eVMPX') {
        setSecondToken({
          ...secondToken,
          balance: bvmpxBalance[0].balance,
          amount: 0
        })
      } else {
        setFirstToken({
          ...firstToken,
          balance: bvmpxBalance[0].balance,
          amount: 0
        })
      }
    } else {
      if (firstToken.symbol === 'eVMPX') {
        setFirstToken({
          ...firstToken,
          balance: evmpxBalance[0].balance,
          amount: 0
        })
      } else {
        setSecondToken({
          ...secondToken,
          balance: evmpxBalance[0].balance,
          amount: 0
        })
      }
    }
  }

  const checkIfMetaMaskIsConnected = async () => {
    try {
      const ethereum = window.ethereum

      if (ethereum) {
        await setSpecificChainMetaMask(ethereum)

        const accounts = await ethereum.enable()
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

  const linkAccounts = async () => {
    await createLinkTrx({
      session: state?.user?.session,
      libreAccount: state?.user?.actor,
      address: state.ethAccountAddress
    })
    showMessage({
      type: 'success',
      content: 'Accounts linked'
    })
    await sleep(2000)

    if (await checkMatch(state?.user?.actor, state.ethAccountAddress))
      await sendTransaction()
  }

  const logoutLibre = async () => {
    await walletLogout(state.user.session)
    logout()
  }

  const clearFields = () => {
    setAmountSendEth(0)
    setAmountReceiveEth(0)
    setFirstToken({ ...firstToken, amount: 0 })
    setSecondToken({ ...secondToken, amount: 0 })
  }

  useEffect(async () => {
    await checkIfMetaMaskIsConnected()

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
        alignItems="center"
        bgcolor="secondary.main"
        justifyContent="space-between"
        className={classes.boxHeaderStyle}
      >
        <Box className={classes.titleHeader}>
          <Typography variant="h5">VMPX - ETH /</Typography>
          <Typography variant="h5">BTC Swap</Typography>
        </Box>
        <Box>
          <Tooltip title="Logout from Libre">
            <Typography
              color="white"
              variant="body1"
              onClick={logoutLibre}
              className={classes.cursoStyle}
            >
              {state?.user?.actor}
            </Typography>
          </Tooltip>
          <Typography color="white" variant="body1">
            {state?.ethAccountAddress &&
              `${state?.ethAccountAddress?.substring(
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
          padding={3}
          width="100%"
          maxWidth="536px"
          borderRadius={2}
          border="1px solid #000"
          bgcolor="secondary.main"
          className={classes.swapContainer}
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
            mt={2}
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Box
              mb={1}
              width="100%"
              display="flex"
              alignItems="end"
              flexDirection="column"
              justifyContent="center"
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
              <Tooltip
                title={`Limit by transfer ${blockchainConfig.vmpxTransferLimit}`}
              >
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

                    if (value > blockchainConfig.vmpxTransferLimit) {
                      value = blockchainConfig.vmpxTransferLimit
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
              </Tooltip>
              <Button
                variant="contained"
                disabled={loadingRecieve}
                onClick={sendTransaction}
                className={classes.buttonStyle}
              >
                Receive from ETH{' '}
                {loadingRecieve && <CircularProgress size={18} />}
              </Button>
            </Box>
            <br />
            <Box display="flex" flexDirection="column">
              <Tooltip
                title={`Limit by transfer ${blockchainConfig.vmpxTransferLimit}`}
              >
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

                    if (value > blockchainConfig.vmpxTransferLimit) {
                      value = blockchainConfig.vmpxTransferLimit
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
              </Tooltip>
              <Button
                variant="contained"
                onClick={sendTokensToEth}
                className={classes.buttonStyle}
              >
                Send to ETH
              </Button>
            </Box>
          </Box>
          {state?.ethAccountAddress &&
          state?.user?.actor &&
          !areAccountsLinked ? (
            <Modal
              open={open}
              onClose={handleClose}
              className={classes.modalStyles}
            >
              <div className={classes.linkerBox}>
                <Typography textAlign="center" variant="body1" mb={2}>
                  Libre account and Ethereum account are not linked
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={linkAccounts}
                >
                  Link accounts
                </Button>
              </div>
            </Modal>
          ) : (
            <> </>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default SwapComponent
