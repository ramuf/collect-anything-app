'use client'

import { useState } from 'react'
import { Submission, Form } from '../types'
import { useToast } from '@/components/ui/toast'

export function useSubmissionActions(
  formId: string,
  form: Form | null,
  submissions: Submission[],
  filteredSubmissions: Submission[],
  selectedSubmissions: Set<string>,
  onUpdateSubmission: (submission: Submission) => void,
  onRemoveSubmissions: (ids: string[]) => void,
  onClearSelection: () => void
) {
  const { toast } = useToast()
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null)

  const handleEditSelected = () => {
    const selectedIds = Array.from(selectedSubmissions)
    if (selectedIds.length === 1) {
      const submission = submissions.find(s => s.id === selectedIds[0])
      if (submission) {
        setEditingSubmission(submission)
      }
    }
  }

  const performDeleteSelected = async () => {
    const selectedIds = Array.from(selectedSubmissions)
    if (selectedIds.length === 0) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const deletePromises = selectedIds.map(id =>
        fetch(`${apiUrl}/forms/${formId}/submissions/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        })
      )

      const results = await Promise.all(deletePromises)
      const failed = results.filter(res => !res.ok && res.status !== 204)

      if (failed.length > 0) {
        throw new Error(`${failed.length} deletions failed`)
      }

      onRemoveSubmissions(selectedIds)
      onClearSelection()
      toast({ title: `${selectedIds.length} submission${selectedIds.length > 1 ? 's' : ''} deleted`, variant: 'success' })
    } catch (error) {
      console.error('Failed to delete submissions', error)
      toast({ title: 'Failed to delete submissions', variant: 'destructive' })
    }
  }

  const handleExportCSV = () => {
    if (!form || filteredSubmissions.length === 0) {
      toast({ title: 'No data to export', variant: 'info' })
      return
    }

    const fields = form.schema_ || []
    const headers = ['Submission ID', 'Submitted At', ...fields.map(f => f.label || f.key)]

    const rows = filteredSubmissions.map(sub => {
      const values = fields.map(f => {
        const val = sub.data?.[f.key]
        if (val === undefined || val === null) return ''
        if (Array.isArray(val)) return val.join('; ')
        return String(val)
      })
      return [sub.id, new Date(sub.created_at).toLocaleString(), ...values]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${form.title.toLowerCase().replace(/\s+/g, '-')}-submissions.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleSubmissionSaved = (updatedSubmission: Submission) => {
    onUpdateSubmission(updatedSubmission)
    onClearSelection()
  }

  return {
    editingSubmission,
    setEditingSubmission,
    handleEditSelected,
    performDeleteSelected,
    handleExportCSV,
    handleSubmissionSaved
  }
}