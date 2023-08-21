import React, { memo } from 'react'
import Box from '@mui/material/Box'

import { useSharedState } from '../../context/state.context'
import SwapComponent from '../../components/SwapComponent'
import Vmpxswap from '../../components/Vmpxswap'

const Home = () => {
  const [state] = useSharedState()

  return (
    <Box
      justifyContent="center"
      alignItems="center"
      display="flex"
      height="100%"
    >
      {!state?.connectMeta || !state?.connectLibre || !state?.accountMatch ? (
        <Vmpxswap />
      ) : (
        <SwapComponent />
      )}
    </Box>
  )
}

Home.propTypes = {}

export default memo(Home)
