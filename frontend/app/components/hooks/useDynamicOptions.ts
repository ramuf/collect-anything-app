import { useState, useEffect } from 'react'
import { Field, OptionItem } from '../form-fields/types'

export function useDynamicOptions(schema: Field[]) {
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, OptionItem[]>>({})
  const [referenceOptions, setReferenceOptions] = useState<Record<string, {id: string, label: string}[]>>({})

  const fetchReferenceOptions = async (localFieldKey: string, targetFormId: string, displayFieldKey?: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const url = apiUrl ? `${apiUrl}/forms/${targetFormId}/submissions` : `/api/forms/${targetFormId}/submissions`
      const res = await fetch(url)
      if (res.ok) {
        const submissions = await res.json()
        const options = submissions.map((sub: any) => {
          let label: string
          if (displayFieldKey && sub.data[displayFieldKey] !== undefined) {
            // Use the specified display field
            const val = sub.data[displayFieldKey]
            label = typeof val === 'string' ? val : String(val)
          } else {
            // Fallback: find first string value, or use ID
            label = Object.values(sub.data).find(v => typeof v === 'string' && v) as string || `Submission ${sub.id.slice(0, 8)}`
          }
          return { id: sub.id, label }
        })
        setReferenceOptions(prev => ({ ...prev, [localFieldKey]: options }))
      }
    } catch (error) {
      console.error(`Failed to fetch reference options for ${localFieldKey}`, error)
    }
  }

  const fetchFieldOptions = async (localFieldKey: string, formId: string, remoteFieldKey: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const url = apiUrl
        ? `${apiUrl}/forms/${formId}/fields/${remoteFieldKey}/submission-options`
        : `/api/forms/${formId}/fields/${remoteFieldKey}/submission-options`
      const res = await fetch(url)
      if (res.ok) {
        const raw = await res.json()
        const values: OptionItem[] = (raw || []).map((o: any) => ({
          value: String(o.id),
          label: String(o.label),
        }))
        setDynamicOptions(prev => ({ ...prev, [localFieldKey]: values }))
      }
    } catch (error) {
      console.error(`Failed to fetch options for ${localFieldKey}`, error)
    }
  }

  useEffect(() => {
    // Fetch dynamic options for fields that need them
    schema.forEach(field => {
      if (field.dataSource?.type === 'form_lookup' && field.dataSource.formId && field.dataSource.fieldKey) {
        fetchFieldOptions(field.key, field.dataSource.formId, field.dataSource.fieldKey)
      }
      if (field.type === 'reference' && field.targetFormId) {
        fetchReferenceOptions(field.key, field.targetFormId, field.displayFieldKey)
      }
    })
  }, [schema])

  return { dynamicOptions, referenceOptions }
}