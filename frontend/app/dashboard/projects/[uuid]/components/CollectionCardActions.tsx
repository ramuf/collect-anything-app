"use client"

import Link from 'next/link'
import CollectDialog from './CollectDialog'
import { Database } from 'lucide-react'

interface Props {
  id: string
  projectId: string
  onSubmitted?: () => void
}

export default function CollectionCardActions({ id, projectId, onSubmitted }: Props) {
  return (
    <div className="flex items-stretch border-t border-[var(--border)]">
      <CollectDialog formId={id} onSave={onSubmitted} />

      <Link
        href={`/dashboard/projects/${projectId}/data/${id}`}
        className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
      >
        <Database size={16} />
        View Data
      </Link>
    </div>
  )
}
