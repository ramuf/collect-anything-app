"use client"

import React, { useState } from "react"
import { useRouter } from 'next/navigation'
import Dialog, {
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import ProjectForm from './ProjectForm'

type Props = {
  initial?: { id?: string; name?: string; description?: string }
  open?: boolean
  onOpenChange?: (v: boolean) => void
  onSuccess?: (data: any) => void
  trigger?: React.ReactNode
}

export default function NewProjectDialog({ initial, open, onOpenChange, onSuccess, trigger }: Props) {
  const [openLocal, setOpenLocal] = useState(false)
  const router = useRouter()

  const controlled = typeof open !== "undefined"
  const isOpen = controlled ? open : openLocal
  const setOpen = (v: boolean) => {
    if (controlled) onOpenChange?.(v)
    else setOpenLocal(v)
  }

  const handleSave = async (p: { id?: string; name?: string; description?: string }) => {
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8000/api'

      let res: Response
      const payload = { title: p.name || '', description: p.description || '', settings: {} }

      if (initial?.id) {
        res = await fetch(`${apiUrl}/projects/${initial.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`${apiUrl}/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        const data = await res.json()
        setOpen(false)
        onSuccess?.(data)
        if (!initial?.id && data?.id) router.push(`/dashboard/projects/${data.id}`)
        else router.refresh()
      } else {
        console.error('Failed to save project', await res.text())
      }
    } catch (err) {
      console.error('Error saving project', err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <button className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary)]/90 rounded-md">
            New Project
          </button>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogClose asChild>
          <button className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted-foreground)]/6">
            <X size={16} />
          </button>
        </DialogClose>

        <DialogHeader>
          <DialogTitle className="text-lg">{initial?.id ? 'Edit Project' : 'Create Project'}</DialogTitle>
          <DialogDescription className="text-sm text-[var(--muted-foreground)]">Give your project a name and optional description.</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <ProjectForm
            initial={initial ? { id: initial.id, name: initial.name, description: initial.description } : undefined}
            onCancel={() => setOpen(false)}
            onSave={handleSave}
            showHeader={false}
          />
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  )
}
