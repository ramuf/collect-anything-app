import React from 'react'
import { Field, OptionItem } from './types'

interface CheckboxFieldProps {
  field: Field
  value: any
  onChange: (value: any) => void
  dynamicOptions?: Array<string | OptionItem>
}

export default function CheckboxField({ field, value, onChange, dynamicOptions }: CheckboxFieldProps) {
  const options: Array<string | OptionItem> = dynamicOptions || field.options || []
  const normalized = options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt))

  const isLookup = field.dataSource?.type === 'form_lookup' && !!field.dataSource?.formId
  const lookupDisplayField = field.dataSource?.fieldKey || null

  const rawSelected: any[] = Array.isArray(value) ? value : []
  const labelToValue = new Map<string, string>()
  for (const o of normalized) {
    labelToValue.set(o.label.toLowerCase(), o.value)
  }

  const selectedIds: string[] = rawSelected
    .map((v) => {
      if (typeof v === 'object' && v?.id) return String(v.id)
      if (typeof v !== 'string') return String(v)
      return labelToValue.get(v.toLowerCase()) || v
    })
    .filter(Boolean)
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
              type="checkbox"
              value={o.value}
              checked={selectedIds.includes(o.value)}
              onChange={(e) => {
                const current = selectedIds
                const updated = e.target.checked
                  ? [...current, o.value]
                  : current.filter((v: string) => v !== o.value)

                if (isLookup) {
                  onChange(updated.map((id) => ({ id, displayField: lookupDisplayField })))
                  return
                }

                onChange(updated)
              }}
              className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
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