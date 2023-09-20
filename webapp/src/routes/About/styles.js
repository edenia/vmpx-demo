export default theme => ({
  container: {
    height: '100%',
    padding: theme.spacing(9, 7),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(6, 1)
    }
  }
})
