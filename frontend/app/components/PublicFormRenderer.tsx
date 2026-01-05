'use client'

import React, { useState, useMemo } from 'react'
import { Field } from './form-fields/types'
import FieldRenderer from './form-fields/FieldRenderer'
import FormSection from './form-fields/FormSection'
import FormSuccessScreen from './FormSuccessScreen'
import { useCalculatedValues } from './hooks/useCalculatedValues'
import { useFieldVisibility } from './hooks/useFieldVisibility'
import { useDynamicOptions } from './hooks/useDynamicOptions'
import { useFormSubmission } from './hooks/useFormSubmission'
import { useCollapsedSections } from './hooks/useCollapsedSections'
import { groupFieldsBySections } from './utils/formUtils'
import { serializeSubmissionDataForSave } from './utils/submissionData'

interface Form {
  id: string
  title: string
  description?: string
  schema_: Field[]
  _prefillData?: Record<string, unknown>
}

export default function PublicFormRenderer({ form, onSubmitted }: { form: Form, onSubmitted?: () => void }) {
  const [formData, setFormData] = useState<Record<string, unknown>>(form._prefillData || {})

  // Custom hooks for complex logic
  const calculatedValues = useCalculatedValues(formData, form.schema_)
  const fieldVisibility = useFieldVisibility(formData, form.schema_, calculatedValues)
  const { dynamicOptions, referenceOptions } = useDynamicOptions(form.schema_)
  const { submitting, submitted, submitForm } = useFormSubmission(form.id)
  const { collapsedSections, toggleSection } = useCollapsedSections(form.schema_)

  // Group fields by sections
  const groupedFields = useMemo(() => groupFieldsBySections(form.schema_), [form.schema_])

  const handleChange = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = serializeSubmissionDataForSave(form.schema_, formData)
    await submitForm(data)
  }

  if (submitted) {
    if (onSubmitted) onSubmitted()
    return <FormSuccessScreen />
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
            return <FieldRenderer
              key={field.id}
              field={field}
              value={formData[field.key]}
              onChange={(v) => handleChange(field.key, v)}
              dynamicOptions={dynamicOptions[field.key]}
              referenceOptions={referenceOptions[field.key]}
              calculatedValue={calculatedValues[field.key]}
            />
          }}
        />
      ))}

      <div className="pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Form'}
        </button>
      </div>
    </form>
  )
}
