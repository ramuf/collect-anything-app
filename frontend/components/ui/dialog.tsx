"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

export const Dialog = ({ children, open, onOpenChange }: any) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  )
}

export const DialogTrigger = ({ children, ...props }: any) => {
  return (
    <DialogPrimitive.Trigger asChild {...props}>
      {children}
    </DialogPrimitive.Trigger>
  )
}

export const DialogPortal = ({ children }: any) => {
  return (
    <DialogPrimitive.Portal>
      {children}
    </DialogPrimitive.Portal>
  )
}

export const DialogOverlay = ({ className = "", ...props }: any) => (
  <DialogPrimitive.Overlay
    className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm ${className}`}
    {...props}
  />
)

export const DialogContent = ({ children, className = "", ...props }: any) => {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={`fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[rgba(20,20,20,0.92)] p-6 text-[var(--card-foreground)] shadow-lg ${className}`}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="sr-only" />
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

export const DialogHeader = ({ className = "", ...props }: any) => (
  <div className={`mb-4 ${className}`} {...props} />
)

export const DialogFooter = ({ className = "", ...props }: any) => (
  <div className={`mt-6 flex items-center justify-end gap-2 ${className}`} {...props} />
)

export const DialogTitle = ({ children, className = "", ...props }: any) => (
  <DialogPrimitive.Title className={`text-lg font-semibold ${className}`} {...props}>
    {children}
  </DialogPrimitive.Title>
)

export const DialogDescription = ({ children, className = "", ...props }: any) => (
  <DialogPrimitive.Description className={`text-sm text-[var(--muted-foreground)] ${className}`} {...props}>
    {children}
  </DialogPrimitive.Description>
)

export const DialogClose = DialogPrimitive.Close

export default Dialog
