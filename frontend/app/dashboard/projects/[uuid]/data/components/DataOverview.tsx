'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Database, FileText, ChevronRight, Download, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Form {
  id: string
  title: string
  slug: string
  created_at: string
  project_id: string
  schema_: any[]
  settings: any
}

interface FormWithCount extends Form {
  submissionCount: number
}

export default function DataOverview({ projectId }: { projectId: string }) {
  const [forms, setForms] = useState<FormWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchFormsWithCounts()
  }, [projectId])

  const fetchFormsWithCounts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      // Fetch forms
      const formsRes = await fetch(`${apiUrl}/projects/${projectId}/forms`, {
        credentials: 'include'
      })
      
      if (!formsRes.ok) {
        throw new Error('Failed to fetch forms')
      }
      
      const formsData: Form[] = await formsRes.json()
      
      // Fetch submission counts for each form
      const formsWithCounts = await Promise.all(
        formsData.map(async (form) => {
          try {
            const subsRes = await fetch(`${apiUrl}/forms/${form.id}/submissions`, {
              credentials: 'include'
            })
            const subs = subsRes.ok ? await subsRes.json() : []
            return { ...form, submissionCount: subs.length }
          } catch {
            return { ...form, submissionCount: 0 }
          }
        })
      )
      
      setForms(formsWithCounts)
    } catch (error) {
      console.error('Failed to fetch forms', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async (formId: string, formTitle: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      // Fetch form schema
      const formRes = await fetch(`${apiUrl}/forms/${formId}`, {
        credentials: 'include'
      })
      const form = await formRes.json()
      
      // Fetch submissions
      const subsRes = await fetch(`${apiUrl}/forms/${formId}/submissions`, {
        credentials: 'include'
      })
      const submissions = await subsRes.json()
      
      if (submissions.length === 0) {
        toast({ title: 'No submissions to export', variant: 'info' })
        return
      }
      
      // Build CSV headers from schema
      const fields = form.schema_ || []
      const headers = ['Submission ID', 'Submitted At', ...fields.map((f: any) => f.label || f.key)]
      
      // Build CSV rows
      const rows = submissions.map((sub: any) => {
        const values = fields.map((f: any) => {
          const val = sub.data?.[f.key]
          if (val === undefined || val === null) return ''
          if (Array.isArray(val)) return val.join('; ')
          return String(val)
        })
        return [sub.id, new Date(sub.created_at).toLocaleString(), ...values]
      })
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map((row: string[]) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')
      
      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${formTitle.toLowerCase().replace(/\s+/g, '-')}-submissions.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export CSV', error)
      toast({ title: 'Failed to export CSV', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  if (forms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)]">
          <Database size={32} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">No forms yet</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Create a form first to start collecting data.
        </p>
        <Link
          href={`/dashboard/projects/${projectId}/forms`}
          className="mt-6 flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--primary)]/25 transition-transform hover:scale-105"
        >
          <FileText size={16} />
          Go to Forms
        </Link>
      </div>
    )
  }

  const totalSubmissions = forms.reduce((acc, f) => acc + f.submissionCount, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="text-sm text-[var(--muted-foreground)]">Total Forms</div>
          <div className="mt-2 text-3xl font-bold text-[var(--foreground)]">{forms.length}</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="text-sm text-[var(--muted-foreground)]">Total Submissions</div>
          <div className="mt-2 text-3xl font-bold text-[var(--foreground)]">{totalSubmissions}</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="text-sm text-[var(--muted-foreground)]">Forms with Data</div>
          <div className="mt-2 text-3xl font-bold text-[var(--foreground)]">
            {forms.filter(f => f.submissionCount > 0).length}
          </div>
        </div>
      </div>

      {/* Forms list */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="border-b border-[var(--border)] bg-[var(--secondary)]/30 px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Forms</h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {forms.map((form) => (
            <div
              key={form.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-[var(--secondary)]/20 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-medium text-[var(--foreground)]">{form.title}</div>
                  <div className="text-sm text-[var(--muted-foreground)]">
                    {form.submissionCount} {form.submissionCount === 1 ? 'submission' : 'submissions'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {form.submissionCount > 0 && (
                  <button
                    onClick={() => handleExportCSV(form.id, form.title)}
                    className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
                    title="Export to CSV"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                )}
                <Link
                  href={`/dashboard/projects/${projectId}/data/${form.id}`}
                  className="flex items-center gap-1 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
                >
                  View
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
