import React, { Suspense, useMemo } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { StylesProvider, createGenerateClassName } from '@mui/styles'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

import './i18n'
import routes from './routes'
import getTheme from './theme'
import Loader from './components/Loader'
import DashboardLayout from './layouts/Dashboard'
import { useSharedState } from './context/state.context'

const generateClassName = createGenerateClassName({
  productionPrefix: 'vmpxwebapp'
})

function getLibrary(provider) {
  console.log({ provider })
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}
const App = () => {
  const [state] = useSharedState()

  const renderRoute = ({ component: Component, ...route }, index) => (
    <Route
      key={`path-${route.path}-${index}`}
      path={route.path}
      exact={route.exact}
    >
      <Component />
    </Route>
  )

  const userRoutes = useMemo(
    () => routes(state.user?.role || 'guest'),

    [state.user]
  )

  const theme = useMemo(() => getTheme(state.useDarkMode), [state.useDarkMode])

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <BrowserRouter>
        <StylesProvider generateClassName={generateClassName}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DashboardLayout routes={userRoutes.sidebar}>
                <Suspense fallback={<Loader />}>
                  <Switch>{userRoutes?.browser?.map(renderRoute)}</Switch>
                </Suspense>
              </DashboardLayout>
            </LocalizationProvider>
          </ThemeProvider>
        </StylesProvider>
      </BrowserRouter>
    </Web3ReactProvider>
  )
}

export default App
