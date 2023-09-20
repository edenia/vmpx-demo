export default theme => ({
  flipStyle: {
    cursor: 'pointer',
    marginRight: theme.spacing(2)
  },
  textFieldStyles: {
    height: 45,
    marginBottom: theme.spacing(2),
    color: `${theme.palette.common.white} !important`,
    border: `solid 1px ${theme.palette.common.white} !important`
  },
  textFieldSwapStyles: {
    height: 45
  },
  buttonStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    color: `${theme.palette.common.white} !important`,
    backgroundColor: `${theme.palette.secondary.light} !important`
  },
  buttonColor: {
    color: `${theme.palette.common.white} !important`
  },
  modalStyles: {
    backgroundColor: theme.palette.common.white,
    position: 'absolute !important',
    border: '2px solid #000',
    left: '30% !important',
    top: '30% !important',
    bottom: 'auto !important',
    height: 'auto',
    width: 600,
    [theme.breakpoints.down('md')]: {
      left: '12% !important',
      top: '36% !important'
    },
    [theme.breakpoints.down('sm')]: {
      left: '0px !important',
      width: '100%'
    }
  },
  cursoStyle: {
    cursor: 'pointer'
  },
  boxHeaderStyle: {
    padding: theme.spacing(0, 13),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0, 2)
    }
  },
  titleHeader: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      display: 'block'
    }
  },
  swapContainer: {
    height: 570,
    [theme.breakpoints.down('sm')]: {
      height: 625
    }
  },
  linkerBox: {
    padding: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(10, 2)
    }
  },
  menuButtonContainer: {
    display: 'none',
    [theme.breakpoints.down('sm')]: {
      display: 'block'
    }
  },
  showDesktop: {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  }
})
