import React, { memo } from 'react'
import Box from '@mui/material/Box'

import { useSharedState } from '../../context/state.context'
import BoomerActive from '../../components/BoomerActive'
import Vmpxswap from '../../components/Vmpxswap'

const Home = () => {
  const [state] = useSharedState()
  console.log({ state })
  return (
    <Box display="flex" justifyContent="center">
      {!state?.connectMeta || !state?.connectLibre ? (
        <Vmpxswap />
      ) : (
        <BoomerActive />
      )}
    </Box>
  )
}

Home.propTypes = {}

export default memo(Home)
