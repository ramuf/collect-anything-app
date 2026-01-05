'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { Submission, FormField } from './types'
import FieldRenderer from '@/app/components/form-fields/FieldRenderer'
import FormSection from '@/app/components/form-fields/FormSection'
import { useCalculatedValues } from '@/app/components/hooks/useCalculatedValues'
import { useFieldVisibility } from '@/app/components/hooks/useFieldVisibility'
import { useDynamicOptions } from '@/app/components/hooks/useDynamicOptions'
import { useCollapsedSections } from '@/app/components/hooks/useCollapsedSections'
import { groupFieldsBySections } from '@/app/components/utils/formUtils'
import { hydrateSubmissionDataForEditing, serializeSubmissionDataForSave } from '@/app/components/utils/submissionData'

interface EditSubmissionModalProps {
  submission: Submission | null
  formId: string
  fields: FormField[]
  onClose: () => void
  onSave: (updatedSubmission: Submission) => void
}

export default function EditSubmissionModal({ submission, formId, fields, onClose, onSave }: EditSubmissionModalProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Custom hooks for complex logic
  const calculatedValues = useCalculatedValues(formData, fields)
  const fieldVisibility = useFieldVisibility(formData, fields, calculatedValues)
  const { dynamicOptions, referenceOptions } = useDynamicOptions(fields)
  const { collapsedSections, toggleSection } = useCollapsedSections(fields)

  // Group fields by sections
  const groupedFields = useMemo(() => groupFieldsBySections(fields), [fields])

  useEffect(() => {
    if (submission) {
      setFormData(hydrateSubmissionDataForEditing(fields, submission.data || {}))
    }
  }, [submission])

  if (!submission) return null

  const handleFieldChange = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/forms/${formId}/submissions/${submission.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...submission, data: serializeSubmissionDataForSave(fields, formData) })
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.detail ? JSON.stringify(errBody.detail) : 'Save failed')
      }
      const updated = await res.json()
      onSave(updated)
      toast({ title: 'Submission updated', variant: 'success' })
      onClose()
    } catch (err) {
      console.error('Failed to save submission', err)
      toast({ title: 'Failed to save submission', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-lg bg-[var(--card)] p-6 shadow-lg overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Edit Submission</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Editing submission {submission.id}</p>
          </div>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <X />
          </button>
        </div>

        <div className="mt-4 space-y-6">
          {groupedFields.map((group, groupIndex) => (
            <FormSection
              key={group.section?.id || `group-${groupIndex}`}
              section={group.section}
              fields={group.fields}
              collapsed={collapsedSections[group.section?.id || '']}
              onToggle={() => group.section && toggleSection(group.section.id)}
              renderField={(field) => {
                if (!fieldVisibility[field.id]) return null
                return <FieldRenderer
                  key={field.id}
                  field={field}
                  value={formData[field.key]}
                  onChange={(v: unknown) => handleFieldChange(field.key, v)}
                  dynamicOptions={dynamicOptions[field.key]}
                  referenceOptions={referenceOptions[field.key]}
                  calculatedValue={calculatedValues[field.key]}
                />
              }}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)]">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}