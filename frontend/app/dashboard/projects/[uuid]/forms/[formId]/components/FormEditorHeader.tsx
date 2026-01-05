'use client'

import React from 'react'
import {
  ArrowLeft, Eye, Save
} from 'lucide-react'
import Link from 'next/link'

interface Form {
  id: string
  title: string
  slug: string
  project_id: string
  schema_: Field[]
  settings: any
}

interface Field {
  id: string
  type: string
  label: string
  key: string
  required: boolean
  placeholder?: string
  options?: string[]
  helpText?: string
  targetFormId?: string
  displayFieldKey?: string
  dataSource?: {
    type: 'static' | 'form_lookup'
    formId?: string
    fieldKey?: string
  }
  formula?: string
  conditions?: {
    fieldKey: string
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
    value?: string | number | boolean
    action: 'show' | 'hide'
  }[]
  collapsed?: boolean
  sectionFields?: string[]
}

interface FormEditorHeaderProps {
  form: Form | null
  saving: boolean
  saveForm: () => void
  projectId: string
}

export default function FormEditorHeader({ form, saving, saveForm, projectId }: FormEditorHeaderProps) {
  if (!form) return null

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/projects/${projectId}`} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-[var(--foreground)]">{form.title}</h1>
          <p className="text-xs text-[var(--muted-foreground)] font-mono">/{form.slug}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={`/forms/${form.id}`}
          target="_blank"
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] rounded-md transition-colors"
        >
          <Eye size={16} /> Preview
        </Link>
        <button
          onClick={saveForm}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Form'}
        </button>
      </div>
    </header>
  )
}