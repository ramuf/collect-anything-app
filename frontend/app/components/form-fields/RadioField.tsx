import React from 'react'
import { Field, OptionItem } from './types'

interface RadioFieldProps {
  field: Field
  value: any
  onChange: (value: any) => void
  dynamicOptions?: Array<string | OptionItem>
}

export default function RadioField({ field, value, onChange, dynamicOptions }: RadioFieldProps) {
  const options: Array<string | OptionItem> = dynamicOptions || field.options || []

  const isLookup = field.dataSource?.type === 'form_lookup' && !!field.dataSource?.formId
  const lookupDisplayField = field.dataSource?.fieldKey || null

  const normalized = options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt))
  const labelToValue = new Map<string, string>()
  const valueSet = new Set<string>()
  for (const o of normalized) {
    valueSet.add(o.value)
    labelToValue.set(o.label.toLowerCase(), o.value)
  }

  const resolvedValue = (() => {
    if (!value) return ''
    if (typeof value === 'object' && value?.id) return String(value.id)
    if (typeof value !== 'string') return String(value)
    if (valueSet.has(value)) return value
    return labelToValue.get(value.toLowerCase()) || value
  })()

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </label>
      <div className="space-y-2 pt-1">
        {normalized.map((o, i: number) => {
          return (
          <label key={o.value || i} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={field.key}
              value={o.value}
              required={field.required}
              checked={resolvedValue === o.value}
              onChange={(e) => {
                const selectedId = e.target.value
                if (isLookup) {
                  onChange({ id: selectedId, displayField: lookupDisplayField })
                  return
                }
                onChange(selectedId)
              }}
              className="w-4 h-4 text-primary border-input focus:ring-ring"
            />
            <span className="text-sm text-muted-foreground">{o.label}</span>
          </label>
        )})}
      </div>
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  )
}