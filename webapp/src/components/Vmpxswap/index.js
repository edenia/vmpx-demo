import React from 'react'
import Box from '@mui/material/Box'
import { Button, Typography } from '@mui/material'

import { useSharedState } from '../../context/state.context'

const Vmpxswap = () => {
  const [, { setState }] = useSharedState()

  const connectMetaMask = () => {
    setState({ param: 'connectMeta', connectMeta: true })
    setState({ param: 'user', user: 'Boomer' })
  }

  const connectLibre = () => {
    setState({ param: 'connectLibre', connectLibre: true })
    setState({ param: 'user', user: 'Boomer' })
  }

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
      <Box mt={6} display="flex" flexDirection="column" paddingX={18}>
        <Button variant="outlined" onClick={() => connectMetaMask()}>
          Connect Metamask
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
