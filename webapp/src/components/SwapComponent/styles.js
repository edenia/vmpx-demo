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
  }
})
