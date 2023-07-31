import React from 'react'
import Box from '@mui/material/Box'
import { Button, Typography } from '@mui/material'

import { useSharedState } from '../../context/state.context'

const BoomerActive = () => {
  const [state] = useSharedState()

  const data = [
    { token: '200', symbol: 'eVMPX' },
    { token: '198', symbol: 'bVMPX' }
  ]

  return (
    <Box
      border="1px solid rgb(222, 222, 226)"
      borderRadius={2}
      maxWidth="552px"
      bgcolor="white"
      width="100%"
      padding={3}
    >
      <Box display="flex" justifyContent="flex-end">
        <Box>
          <Typography variant="body1">{state.user}</Typography>
          <Typography variant="body1">0x5622...hg6</Typography>
        </Box>
      </Box>
      <Box
        justifyContent="center"
        flexDirection="column"
        display="flex"
        mt={2}
        paddingX={24}
      >
        {data.map(item => (
          <Box display="flex" justifyContent="center" key={item.symbol}>
            <Typography marginRight={2} variant="body1">
              {item.token}
            </Typography>
            <Typography variant="body1">{item.symbol}</Typography>
          </Box>
        ))}
        <br />
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
