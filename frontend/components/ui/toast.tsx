"use client"

import React, { createContext, useContext } from 'react'
import { Toaster, toast as sonnerToast } from 'sonner'

type ToastVariant = 'default' | 'success' | 'destructive' | 'info'

type ToastContextType = {
  toast: (opts: { title: string; description?: string; variant?: ToastVariant }) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = (opts: { title: string; description?: string; variant?: ToastVariant }) => {
    const message = opts.description ? `${opts.title}\n${opts.description}` : opts.title
    switch (opts.variant) {
      case 'success':
        sonnerToast.success(message)
        break
      case 'destructive':
        sonnerToast.error(message)
        break
      case 'info':
        sonnerToast(message)
        break
      default:
        sonnerToast(message)
    }
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toaster position="bottom-right" richColors />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

export default ToastProvider
