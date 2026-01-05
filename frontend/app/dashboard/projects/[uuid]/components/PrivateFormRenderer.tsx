'use client'

import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react'
import { Field } from '../../../../components/form-fields/types'
import FieldRenderer from '../../../../components/form-fields/FieldRenderer'
import FormSection from '../../../../components/form-fields/FormSection'
import { useCalculatedValues } from '../../../../components/hooks/useCalculatedValues'
import { useFieldVisibility } from '../../../../components/hooks/useFieldVisibility'
import { useDynamicOptions } from '../../../../components/hooks/useDynamicOptions'
import { useCollapsedSections } from '../../../../components/hooks/useCollapsedSections'
import { groupFieldsBySections } from '../../../../components/utils/formUtils'
import { useToast } from '@/components/ui/toast'
import { hydrateSubmissionDataForEditing, serializeSubmissionDataForSave } from '../../../../components/utils/submissionData'

interface Form {
  id: string
  title: string
  description?: string
  schema_: Field[]
}

export interface PrivateFormRendererHandle {
  submit: () => Promise<boolean>
  isSubmitting: boolean
}

interface PrivateFormRendererProps {
  form: Form
  initialData?: Record<string, unknown>
  isEditing?: boolean
  submission?: Record<string, unknown> & { id?: string }
  onSubmitSuccess?: (updatedSubmission?: unknown) => void
  onSubmitError?: (error: Error) => void
}

const PrivateFormRenderer = forwardRef<PrivateFormRendererHandle, PrivateFormRendererProps>(
  ({ form, initialData = {}, isEditing = false, submission, onSubmitSuccess, onSubmitError }, ref) => {
    const [formData, setFormData] = useState<Record<string, unknown>>(
      hydrateSubmissionDataForEditing(form.schema_, initialData)
    )
    const [submitting, setSubmitting] = useState(false)
    const { toast } = useToast()

    // Custom hooks for complex logic
    const calculatedValues = useCalculatedValues(formData, form.schema_)
    const fieldVisibility = useFieldVisibility(formData, form.schema_, calculatedValues)
    const { dynamicOptions, referenceOptions } = useDynamicOptions(form.schema_)
    const { collapsedSections, toggleSection } = useCollapsedSections(form.schema_)

    // Group fields by sections
    const groupedFields = useMemo(() => groupFieldsBySections(form.schema_), [form.schema_])

    const handleChange = (key: string, value: unknown) => {
      setFormData(prev => ({ ...prev, [key]: value }))
    }

    const submitForm = async (): Promise<boolean> => {
      setSubmitting(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
        
        const url = isEditing && submission 
          ? `${apiUrl}/forms/${form.id}/submissions/${submission.id}`
          : `${apiUrl}/forms/${form.id}/submissions`
        const method = isEditing ? 'PUT' : 'POST'
        
        const res = await fetch(url, {
          method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            isEditing
              ? { ...submission, data: serializeSubmissionDataForSave(form.schema_, formData) }
              : { data: serializeSubmissionDataForSave(form.schema_, formData) }
          )
        })

        if (res.ok) {
          const updated = isEditing ? await res.json() : null
          const message = isEditing ? 'Submission updated successfully' : 'Submission saved successfully'
          toast({ title: message })
          onSubmitSuccess?.(updated)
          return true
        } else {
          const errorData = await res.json().catch(() => ({}))
          toast({ 
            title: 'Failed to submit form', 
            description: errorData.detail || 'Please try again',
            variant: 'destructive' 
          })
          onSubmitError?.(new Error(errorData.detail || 'Submission failed'))
          return false
        }
      } catch (error) {
        console.error('Submission error', error)
        toast({ title: 'An error occurred', variant: 'destructive' })
        onSubmitError?.(error as Error)
        return false
      } finally {
        setSubmitting(false)
      }
    }

    // Expose submit method to parent via ref
    useImperativeHandle(ref, () => ({
      submit: submitForm,
      isSubmitting: submitting
    }), [submitting, formData, submitForm])

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      await submitForm()
    }

    return (
      <form data-form-root onSubmit={handleSubmit} className="space-y-6">
        {groupedFields.map((group, groupIndex) => (
          <FormSection
            key={group.section?.id || `group-${groupIndex}`}
            section={group.section}
            fields={group.fields}
            collapsed={collapsedSections[group.section?.id || '']}
            onToggle={() => group.section && toggleSection(group.section.id)}
            renderField={(field) => {
              if (!fieldVisibility[field.id]) return null
              return (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={formData[field.key]}
                  onChange={(v) => handleChange(field.key, v)}
                  dynamicOptions={dynamicOptions[field.key]}
                  referenceOptions={referenceOptions[field.key]}
                  calculatedValue={calculatedValues[field.key]}
                />
              )
            }}
          />
        ))}
      </form>
    )
  }
)

PrivateFormRenderer.displayName = 'PrivateFormRenderer'

export default PrivateFormRenderer
