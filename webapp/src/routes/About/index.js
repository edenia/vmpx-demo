import React, { memo } from 'react'
import Box from '@mui/material/Box'
import { makeStyles } from '@mui/styles'
import { Typography } from '@mui/material'

import styles from './styles'

const useStyles = makeStyles(styles)

const About = () => {
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <Box
        bgcolor="secondary.main"
        border="1px solid #000"
        padding="56px 32px"
        borderRadius={2}
        width="100%"
      >
        <Typography variant="h5" mb={2}>
          About
        </Typography>
        <Typography variant="body1">
          VMPX Libre is a platform that offers trading services for eVMPX and
          bVMPX. It allows users to bridge VMPX tokens from Ethereum to Libre
          and vice versa. Additionally, it provides a secure and efficient way
          to trade VMPX tokens using an AMM tool, facilitating seamless
          transactions and enhancing the trading experience for users
        </Typography>
        <Typography variant="h5" mt={8} mb={2}>
          Objective
        </Typography>
        <Typography variant="body1">
          Create a user-friendly environment on the Libre blockchain to trade
          eVMPX and bVMPX by leveraging advanced technologies and security
          measures, so users can trade VMPX tokens with confidence.
        </Typography>
      </Box>
    </div>
  )
}

About.propTypes = {}

export default memo(About)
