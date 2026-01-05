'use client'

import React from 'react'
import Link from 'next/link'
import { Database, ExternalLink } from 'lucide-react'

interface EmptyStateProps {
  formId: string
}

export default function EmptyState({ formId }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)]">
        <Database size={32} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">No submissions yet</h3>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Share your form to start collecting data.
      </p>
      <Link
        href={`/forms/${formId}`}
        target="_blank"
        className="mt-6 flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--primary)]/25 transition-transform hover:scale-105"
      >
        <ExternalLink size={16} />
        Open Form
      </Link>
    </div>
  )
}