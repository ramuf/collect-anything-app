'use client'

import React, { useState, useEffect } from 'react'
import { useConfirm } from '@/components/ui/confirm'
import { Plus, FileText } from 'lucide-react'
import CollectionCard from './CollectionCard'
import Dialog, {
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'

interface Form {
  id: string
  title: string
  slug: string
  created_at: string
  project_id: string
  schema_: any[]
  settings: any
}

export default function FormsList({ projectId }: { projectId: string }) {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [newFormTitle, setNewFormTitle] = useState('')
  const [newFormSlug, setNewFormSlug] = useState('')
  const confirm = useConfirm()

  useEffect(() => {
    fetchForms()
  }, [projectId])

  const fetchForms = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/projects/${projectId}/forms`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setForms(data)
      }
    } catch (error) {
      console.error('Failed to fetch forms', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/projects/${projectId}/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newFormTitle,
          slug: newFormSlug || newFormTitle.toLowerCase().replace(/\s+/g, '-'),
          project_id: projectId,
          schema_: [],
          settings: {}
        }),
        credentials: 'include'
      })
      if (res.ok) {
        setNewFormTitle('')
        setNewFormSlug('')
        setOpen(false)
        fetchForms()
      }
    } catch (error) {
      console.error('Failed to create form', error)
    }
  }

  const handleDeleteForm = async (formId: string) => {
    const ok = await confirm({ title: 'Delete collection', description: 'Are you sure you want to delete this form?' })
    if (!ok) return
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/forms/${formId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        fetchForms()
      }
    } catch (error) {
      console.error('Failed to delete form', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Collections</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <button className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--primary)]/25 transition-transform hover:scale-105">
              <Plus size={16} />
              New Collection
            </button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>Start a new collection to gather submissions.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Title</label>
                <input
                  type="text"
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                  placeholder="e.g. Customer Feedback"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Slug (optional)</label>
                <input
                  type="text"
                  value={newFormSlug}
                  onChange={(e) => setNewFormSlug(e.target.value)}
                  className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                  placeholder="e.g. customer-feedback"
                />
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary)]/90 transition-colors shadow-sm"
                >
                  Create
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)]">
            <FileText size={32} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">No collections yet</h3>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Create your first collection to start gathering data.
          </p>
          <div className="mt-6">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger>
                <button className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--primary)]/25 transition-transform hover:scale-105">
                  <Plus size={16} />
                  Create Collection
                </button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <CollectionCard
              key={form.id}
              id={form.id}
              title={form.title}
              slug={form.slug}
              createdAt={form.created_at}
              projectId={projectId}
              onDelete={() => handleDeleteForm(form.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
