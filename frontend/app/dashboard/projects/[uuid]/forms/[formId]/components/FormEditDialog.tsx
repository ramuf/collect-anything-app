"use client"

import React, { useState, useEffect } from 'react'
import Dialog, { DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { X } from 'lucide-react'

type Props = {
  initial?: { title?: string; slug?: string; description?: string }
  open?: boolean
  onOpenChange?: (v: boolean) => void
  onSave?: (data: { title?: string; slug?: string; description?: string }) => void
  trigger?: React.ReactNode
}

export default function FormEditDialog({ initial, open, onOpenChange, onSave, trigger }: Props) {
  const [openLocal, setOpenLocal] = useState(false)

  const controlled = typeof open !== 'undefined'
  const isOpen = controlled ? open : openLocal
  const setOpen = (v: boolean) => {
    if (controlled) onOpenChange?.(v)
    else setOpenLocal(v)
  }

  const [title, setTitle] = useState(initial?.title || '')
  const [slug, setSlug] = useState(initial?.slug || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTitle(initial?.title || '')
    setSlug(initial?.slug || '')
    setDescription(initial?.description || '')
  }, [initial])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave?.({ title, slug, description })
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Edit</button>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogClose asChild>
          <button className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted-foreground)]/6">
            <X size={16} />
          </button>
        </DialogClose>

        <DialogHeader>
          <DialogTitle className="text-lg">Edit Collection</DialogTitle>
          <DialogDescription className="text-sm text-[var(--muted-foreground)]">Update title, slug, or description.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
              placeholder="Title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Slug (optional)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
              placeholder="e.g. customer-feedback"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[88px] rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
              placeholder="Short description (optional)"
            />
          </div>

          <DialogFooter>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving || !title} className="inline-flex items-center gap-2 rounded-md px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>

              <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md px-4 py-2 border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted-foreground)]/6">
                Cancel
              </button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
