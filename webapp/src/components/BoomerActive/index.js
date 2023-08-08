import React, { useState } from 'react'
import Box from '@mui/material/Box'
import { makeStyles } from '@mui/styles'
import InputAdornment from '@mui/material/InputAdornment'
import { Button, Typography, OutlinedInput } from '@mui/material'
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined'

import { useSharedState } from '../../context/state.context'

import styles from './styles'

const useStyles = makeStyles(styles)

const BoomerActive = () => {
  const classes = useStyles()
  const [state] = useSharedState()
  const [firstToken, setFirstToken] = useState({ amount: 0, symbol: 'eVMPX' })
  const [secondToken, setSecondToken] = useState({ amount: 0, symbol: 'bVMPX' })

  const balances = [
    { token: '100', symbol: 'eVMPX' },
    { token: '100', symbol: 'bVMPX' }
  ]

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

  return (
    <Box
      border="1px solid rgb(222, 222, 226)"
      borderRadius={2}
      maxWidth="552px"
      bgcolor="white"
      width="100%"
      padding={3}
    >
      <Box display="flex" justifyContent="space-between">
        <Box>
          <Typography variant="body1">Balances:</Typography>
          {balances.map(item => (
            <Box display="flex" justifyContent="center" key={item.symbol}>
              <Typography marginRight={2} variant="body2">
                {item.token}
              </Typography>
              <Typography variant="body2">{item.symbol}</Typography>
            </Box>
          ))}
        </Box>
        <Box>
          <Typography variant="body1">{state.user.actor}</Typography>
          <Typography variant="body1">{state.ethAccountAddress}</Typography>
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
          <Box display="flex" marginY={1} justifyContent="center">
            <OutlinedInput
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
          <Box display="flex" marginY={1} justifyContent="center">
            <OutlinedInput
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
        <Button variant="outlined">Receive from ETH</Button>
        <br />
        <Button variant="outlined">Send to ETH</Button>
      </Box>
    </Box>
  )
}

export default BoomerActive
