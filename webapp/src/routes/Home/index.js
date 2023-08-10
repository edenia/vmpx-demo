import React, { memo } from 'react'
import Box from '@mui/material/Box'

import { useSharedState } from '../../context/state.context'
import SwapComponent from '../../components/SwapComponent'
import Vmpxswap from '../../components/Vmpxswap'

const Home = () => {
  const [state] = useSharedState()
  console.log({ state })
  return (
    <Box display="flex" justifyContent="center">
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
