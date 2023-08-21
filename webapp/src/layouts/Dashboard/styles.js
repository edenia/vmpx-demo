export default (theme, drawerWidth) => ({
  root: {
    display: 'flex',
    minHeight: '100vh'
  },
  drawer: {
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      flexShrink: 0
    }
  },
  mainContent: {
    backgroundColor: theme.palette.secondary.dark,
    flexDirection: 'column',
    overflow: 'hidden',
    maxWidth: '100%',
    display: 'flex',
    height: '100vh',
    flex: 1
  },
  childContent: {
    flex: 1,
    height: '100%',
    marginBottom: theme.spacing(2),
    overflow: 'auto'
  }
})
