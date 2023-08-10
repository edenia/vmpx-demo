import React, { useEffect } from 'react'
import PropTypes from 'prop-types'

import { loginLibre, restoreSession } from './LibreClient'

// import { wax } from '../utils'

const SharedStateContext = React.createContext()
const initialValue = {
  useDarkMode: false,
  user: null,
  ethAccountAddress: null,
  connectMeta: false,
  connectLibre: false,
  accountMatch: false
}

const sharedStateReducer = (state, action) => {
  switch (action.type) {
    case 'set': {
      return {
        ...state,
        ...action.payload
      }
    }

    case 'showMessage':
      return {
        ...state,
        message: action.payload
      }

    case 'hideMessage':
      return {
        ...state,
        message: null
      }

    default: {
      throw new Error(`Unsupported action type: ${action.type}`)
    }
  }
}

export const SharedStateProvider = ({ children, ...props }) => {
  const [state, dispatch] = React.useReducer(sharedStateReducer, {
    ...initialValue
  })
  const value = React.useMemo(() => [state, dispatch], [state])

  useEffect(() => {
    const load = async () => {
      const { user } = await restoreSession()

      if (user) {
        dispatch({ type: 'set', payload: { user } })
      }
    }

    load()
  }, [])

  return (
    <SharedStateContext.Provider value={value} {...props}>
      {children}
    </SharedStateContext.Provider>
  )
}

SharedStateProvider.propTypes = {
  children: PropTypes.node
}

export const useSharedState = () => {
  const context = React.useContext(SharedStateContext)

  if (!context) {
    throw new Error(`useSharedState must be used within a SharedStateContext`)
  }

  const [state, dispatch] = context
  const setState = payload => dispatch({ type: 'set', payload })
  const showMessage = payload => dispatch({ type: 'showMessage', payload })
  const hideMessage = () => dispatch({ type: 'hideMessage' })
  const login = async () => {
    const { user, error } = await loginLibre()

    dispatch({ type: 'set', payload: { user } })

    return { user, error }
  }
  const logout = () => {
    dispatch({ type: 'set', payload: { user: null } })
  }

  return [state, { setState, showMessage, hideMessage, login, logout }]
}
