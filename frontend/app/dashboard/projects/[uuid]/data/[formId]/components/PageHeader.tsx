'use client'

import Link from 'next/link'
import { Download, RefreshCw, ExternalLink, ArrowLeft, Edit, Plus } from 'lucide-react'
import { Form } from './types'

interface PageHeaderProps {
  projectId: string
  form: Form
  submissionsCount: number
  refreshing: boolean
  filteredCount: number
  onRefresh: () => void
  onExport: () => void
  onCreate?: () => void
}

export default function PageHeader({
  projectId,
  form,
  submissionsCount,
  refreshing,
  filteredCount,
  onRefresh,
  onExport,
  onCreate
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        href={`/dashboard/projects/${projectId}/data`}
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        Back to Data Overview
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">{form.title}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {filteredCount} of {submissionsCount} {submissionsCount === 1 ? 'submission' : 'submissions'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center gap-1 rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Submission</span>
            </button>
          )}
          <Link
            href={`/dashboard/projects/${projectId}/forms/${form.id}`}
            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
            title="Edit form"
          >
            <Edit size={16} />
            <span className="hidden sm:inline">Edit Form</span>
          </Link>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onExport}
            disabled={filteredCount === 0}
            className="flex items-center gap-1 rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}