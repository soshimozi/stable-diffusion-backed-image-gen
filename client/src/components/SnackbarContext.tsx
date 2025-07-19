// SnackbarContext.tsx
import React, { createContext, useContext, useState, type ReactNode } from 'react'
import { Snackbar, Alert } from '@mui/material'

type SnackbarOptions = {
  message: string
  variant?: 'success'|'error'|'info'|'warning'
  autoHideDuration?: number,
  action?: React.ReactNode,
  verticalAnchor?: 'top' | 'bottom',
  horizontalAnchor?: 'left' | 'center' | 'right'
}

type ContextValue = {
  showSnackbar: (opts: SnackbarOptions) => void
}

const SnackbarContext = createContext<ContextValue|undefined>(undefined)

export const SnackbarProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [queue, setQueue] = useState<SnackbarOptions[]>([])
  const [current, setCurrent] = useState<SnackbarOptions|undefined>(undefined)

  // whenever queue changes and nothing is showing, show the next
  React.useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0])
      setQueue(q => q.slice(1))
    }
  }, [queue, current])

  const showSnackbar = (opts: SnackbarOptions) => {
    setQueue(q => [...q, opts])
  }

  const handleClose = () => {
    setCurrent(undefined)
  }

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {current && (
        <Snackbar
          open
          autoHideDuration={current.autoHideDuration ?? 3000}
          onClose={handleClose}
          anchorOrigin={{ vertical: current.verticalAnchor ? current.verticalAnchor : 'bottom', horizontal: current.horizontalAnchor ? current.horizontalAnchor : 'center' }}
        >
          <Alert action={current.action} onClose={handleClose} severity={current.variant ?? 'info'} elevation={6} variant="filled">
            {current.message}
          </Alert>
        </Snackbar>
      )}
    </SnackbarContext.Provider>
  )
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext)
  if (!ctx) throw new Error('useSnackbar must be inside SnackbarProvider')
  return ctx
}
