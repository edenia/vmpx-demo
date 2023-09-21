import React from 'react'
import {
  Link,
  List,
  Drawer,
  Tooltip,
  ListItem,
  Typography,
  ListItemButton,
  Divider
} from '@mui/material'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import { makeStyles } from '@mui/styles'
import InfoIcon from '@mui/icons-material/Info'
import HelpIcon from '@mui/icons-material/Help'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'

import { useSharedState } from '../../context/state.context'
import { logout as walletLogout } from '../../utils/LibreClient'

import styles from './styles'

const useStyles = makeStyles(styles)

const MobileMenu = ({ openMobileMenu, setOpenMobileMenu }) => {
  const classes = useStyles()
  const [state, { logout }] = useSharedState()

  const logoutLibre = async () => {
    await walletLogout(state.user.session)
    logout()
  }

  return (
    <Drawer
      anchor="right"
      open={openMobileMenu}
      onClose={() => setOpenMobileMenu(false)}
    >
      <Box
        width={200}
        height="100%"
        bgcolor="#454545"
        role="presentation"
        onClick={() => setOpenMobileMenu(false)}
        onKeyDown={() => setOpenMobileMenu(false)}
      >
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <Box marginY={2} display="flex" alignItems="center">
                <AccountCircleIcon fontSize="large" />
                <Box ml={2}>
                  <Tooltip title="Logout from Libre">
                    <Typography
                      align="left"
                      color="white"
                      variant="body1"
                      fontWeight="bold"
                      onClick={logoutLibre}
                      className={classes.cursoStyle}
                    >
                      {state?.user?.actor}
                    </Typography>
                  </Tooltip>
                  <Typography
                    align="left"
                    color="white"
                    variant="body1"
                    fontWeight="bold"
                  >
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
            </ListItemButton>
          </ListItem>
          <Divider color="white" />
          <ListItem disablePadding>
            <ListItemButton>
              <Box display="flex" alignItems="center" mt={2}>
                <HelpIcon fontSize="large" />
                <Typography variant="h6" ml={2}>
                  <Link
                    color="white"
                    target="_blank"
                    underline="none"
                    href="https://gist.github.com/leisterfrancisco/307a93fcb3eb10c6dc24e62c42c33aae"
                  >
                    Getting Started
                  </Link>
                </Typography>
              </Box>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <Box display="flex" alignItems="center" mt={1}>
                <InfoIcon fontSize="large" />
                <Typography variant="h6" ml={2}>
                  <Link
                    color="white"
                    href="/about"
                    target="_blank"
                    underline="none"
                  >
                    About
                  </Link>
                </Typography>
              </Box>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  )
}

MobileMenu.propTypes = {
  openMobileMenu: PropTypes.bool,
  setOpenMobileMenu: PropTypes.func
}

export default MobileMenu
