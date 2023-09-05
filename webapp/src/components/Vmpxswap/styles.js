export default theme => ({
  container: {
    backgroundColor: theme.palette.secondary.main
  },
  buttonColor: {
    color: `${theme.palette.common.white} !important`,
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    }
  },
  centerContainer: {
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3, 2)
    }
  },
  boxButtonPadding: {
    padding: theme.spacing(0, 4),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0)
    }
  }
})
