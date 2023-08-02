import React from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import { makeStyles } from '@mui/styles'

import Footer from '../../components/Footer'
import Message from '../../components/Message'

import styles from './styles'

const drawerWidth = 260
const useStyles = makeStyles(theme => styles(theme, drawerWidth))

const Dashboard = ({ children, routes }) => {
  const classes = useStyles()

  return (
    <Box className={classes.root}>
      <Box className={classes.mainContent}>
        <Box className={classes.childContent}>{children}</Box>
        <Footer />
        <Message />
      </Box>
    </Box>
  )
}

Dashboard.propTypes = {
  children: PropTypes.node,
  routes: PropTypes.array
}

export default Dashboard
