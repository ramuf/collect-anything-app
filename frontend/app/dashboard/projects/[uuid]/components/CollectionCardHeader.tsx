"use client"

import Link from "next/link"
import { Edit2, Trash2, MoreHorizontal, FileText, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface Props {
  id: string
  title: string
  slug: string
  projectId: string
  onDelete: () => void
}

export default function CollectionCardHeader({ id, title, slug, projectId, onDelete }: Props) {
  const [showMenu, setShowMenu] = useState(false)

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

      <div className="relative">
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
