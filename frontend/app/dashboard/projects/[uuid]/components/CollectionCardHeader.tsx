"use client"

import Link from "next/link"
import { Edit2, Trash2, MoreHorizontal, FileText, Hash } from 'lucide-react'
import Dialog, { DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface Props {
  id: string
  title: string
  slug: string
  projectId: string
  onDelete: () => void
  onUpdate?: () => void
}

export default function CollectionCardHeader({ id, title, slug, projectId, onDelete, onUpdate }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const [open, setOpen] = useState(false)
  const [loadingForm, setLoadingForm] = useState(false)
  const [formData, setFormData] = useState<any | null>(null)

  useEffect(() => {
    if (!open) return
    let mounted = true
    const fetchForm = async () => {
      setLoadingForm(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
        const res = await fetch(`${apiUrl}/forms/${id}`, { credentials: 'include' })
        if (!mounted) return
        if (res.ok) {
          const data = await res.json()
          setFormData(data)
        }
      } catch (e) {
        console.error('Failed to fetch form for edit', e)
      } finally {
        if (mounted) setLoadingForm(false)
      }
    }
    fetchForm()
    return () => { mounted = false }
  }, [open, id])

  return (
    <div className="flex items-center gap-3 px-5 pt-5 pb-3">
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400")}>
        <FileText size={20} />
      </span>

      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-[var(--foreground)] truncate leading-tight">{title}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--muted-foreground)] truncate">
          <Hash size={12} className="flex-shrink-0" />
          {slug}
        </p>
      </div>

      <div className="relative flex items-center gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--secondary)] transition-colors" aria-label="Edit collection">
              <Edit2 size={16} />
            </button>
          </DialogTrigger>

          <DialogContent>
            <DialogClose asChild>
              <button className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted-foreground)]/6">✕</button>
            </DialogClose>

            <DialogHeader>
              <DialogTitle>Edit Collection</DialogTitle>
              <DialogDescription>Update title, slug, or description for this collection.</DialogDescription>
            </DialogHeader>

            {loadingForm ? (
              <div className="py-8 text-center text-[var(--muted-foreground)]">Loading…</div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!formData) return
                  const fd = { ...formData }
                  const formEl = e.currentTarget as HTMLFormElement
                  const formValues = Object.fromEntries(new FormData(formEl))
                  fd.title = (formValues.title as string) || fd.title
                  fd.slug = (formValues.slug as string) || fd.slug
                  fd.settings = { ...(fd.settings || {}), description: (formValues.description as string) || '' }

                  try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
                    const res = await fetch(`${apiUrl}/forms/${id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify(fd),
                    })
                    if (res.ok) {
                      setOpen(false)
                      onUpdate?.()
                    } else {
                      console.error('Failed to update form', await res.text())
                    }
                  } catch (err) {
                    console.error('Error updating form', err)
                  }
                }}
                className="mt-4 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Title</label>
                  <input name="title" defaultValue={formData?.title || title} className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Slug (optional)</label>
                  <input name="slug" defaultValue={formData?.slug || slug} className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Description</label>
                  <textarea name="description" defaultValue={(formData?.settings || {}).description || ''} className="w-full min-h-[88px] rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
                </div>

                <DialogFooter>
                  <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-md">Save</button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu((v) => !v)
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--secondary)] transition-colors"
          aria-label="More actions"
        >
          <MoreHorizontal size={18} />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 w-36 rounded-md border border-[var(--border)] bg-[var(--popover)] py-1 shadow-xl z-30 animate-in fade-in zoom-in-95">
              <Link
                href={`/dashboard/projects/${projectId}/forms/${id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
              >
                <Edit2 size={14} />
                Edit schema
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                  onDelete()
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
