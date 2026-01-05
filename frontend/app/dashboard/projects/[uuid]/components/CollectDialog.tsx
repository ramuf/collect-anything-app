"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import PrivateFormRenderer, { PrivateFormRendererHandle } from './PrivateFormRenderer'
import { Loader2, X } from 'lucide-react'

interface Props {
  formId: string
  submission?: any // For editing mode
  onSave?: (updatedSubmission?: any) => void // Callback after save/submit
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function CollectDialog({ formId, submission, onSave, open: controlledOpen, onOpenChange: controlledOnOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [form, setForm] = useState<any | null>(null)
  const [loadingForm, setLoadingForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<PrivateFormRendererHandle>(null)

  const isEditing = !!submission

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  // Fetch form when dialog opens or editing
  useEffect(() => {
    if ((open || isEditing) && !form && !loadingForm) {
      (async () => {
        try {
          setLoadingForm(true)
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
          const res = await fetch(`${apiUrl}/forms/${formId}`, {
            credentials: 'include'
          })
          if (res.ok) setForm(await res.json())
          else console.error('Failed to fetch form:', res.status, await res.text())
        } catch (err) {
          console.error('Error fetching form', err)
        } finally {
          setLoadingForm(false)
        }
      })()
    }
  }, [open, isEditing, form, loadingForm, formId])

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen)
  }

  const handleSubmit = async () => {
    if (!formRef.current) return
    setIsSubmitting(true)
    const success = await formRef.current.submit()
    setIsSubmitting(false)
    if (success) {
      setOpen(false)
      setForm(null) // Reset form for next open
      if (isEditing && onSave) {
        // For editing, we need to get the updated submission
        // This might need adjustment based on how submit works
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <button className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors border-r border-[var(--border)]">
            <span className="sr-only">Open collect dialog</span>
            Collect
          </button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-4xl w-[92vw] h-[86vh] flex flex-col rounded-lg shadow-2xl p-0 overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 backdrop-blur-sm py-2 px-6 border-b border-[var(--border)] flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-xl leading-tight font-semibold truncate">
              {loadingForm ? 'Loading...' : (isEditing ? `Edit Submission` : (form?.title || 'Collect'))}
            </DialogTitle>
            {form?.description && (
              <DialogDescription className="text-sm text-[var(--muted-foreground)] mt-1 truncate">
                {form.description}
              </DialogDescription>
            )}
          </div>

          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close" className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loadingForm && (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
            </div>
          )}

          {!loadingForm && form && (
            <div className="max-w-3xl mx-auto">
              <PrivateFormRenderer 
                ref={formRef} 
                form={form} 
                initialData={isEditing ? submission.data : undefined}
                isEditing={isEditing}
                submission={isEditing ? submission : undefined}
                onSubmitSuccess={(updatedSubmission) => {
                  setOpen(false)
                  setForm(null)
                  if (onSave) {
                    if (isEditing && updatedSubmission) {
                      onSave(updatedSubmission)
                    } else if (!isEditing) {
                      onSave()
                    }
                  }
                }}
              />
            </div>
          )}

          {!loadingForm && !form && (
            <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              Unable to load form.
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-30 py-4 px-6 backdrop-blur-sm border-t border-[var(--border)] shrink-0">
          <div className="mx-auto max-w-3xl flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loadingForm || !form || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Saving...' : 'Submitting...'}
                </>
              ) : (
                isEditing ? 'Save Changes' : 'Submit'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
