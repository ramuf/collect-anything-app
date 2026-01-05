"use client"

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import Dialog, { DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './dialog'

type ConfirmOptions = {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
}

type ConfirmContextType = {
  confirm: (opts?: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [opts, setOpts] = useState<ConfirmOptions>({})
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null)

  const confirm = useCallback((o: ConfirmOptions = {}) => {
    setOpts({ ...{ title: 'Are you sure?', description: '' }, ...o })
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve)
    })
  }, [])

  const handleClose = (result: boolean) => {
    setOpen(false)
    if (resolver) {
      resolver(result)
      setResolver(null)
    }
  }

  const value = useMemo(() => ({ confirm }), [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) handleClose(false); setOpen(v) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{opts.title}</DialogTitle>
            {opts.description && <DialogDescription>{opts.description}</DialogDescription>}
          </DialogHeader>

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="px-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              {opts.cancelText || 'Cancel'}
            </button>
            <button
              type="button"
              onClick={() => handleClose(true)}
              className="px-4 py-2 text-sm bg-[var(--destructive)] text-white rounded-md hover:opacity-90 transition-colors"
            >
              {opts.confirmText || 'Confirm'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider')
  return ctx.confirm
}

export default ConfirmProvider
