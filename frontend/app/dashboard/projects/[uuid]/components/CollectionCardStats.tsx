"use client"

import { Database, Calendar } from 'lucide-react'

interface Props {
  count: number | null
  createdAt: string
}

export default function CollectionCardStats({ count, createdAt }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] bg-[var(--secondary)]/30 px-5 py-3">
      <div className="flex items-center gap-2">
        <Database size={14} className="text-[var(--muted-foreground)]" />
        <span className="text-sm font-medium text-[var(--foreground)]">
          {count === null ? <span className="inline-block h-4 w-4 animate-spin rounded-full bg-[var(--muted-foreground)]" /> : count}
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">records</span>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <Calendar size={14} className="text-[var(--muted-foreground)]" />
        <span className="text-xs text-[var(--muted-foreground)]">
          {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </div>
  )
}
