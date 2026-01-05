import React from 'react'
import { Field, OptionItem } from './types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SelectFieldProps {
  field: Field
  value: any
  onChange: (value: any) => void
  dynamicOptions?: Array<string | OptionItem>
}

export default function SelectField({ field, value, onChange, dynamicOptions }: SelectFieldProps) {
  const options: Array<string | OptionItem> = dynamicOptions || field.options || []
  const normalized = options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt))

  const isLookup = field.dataSource?.type === 'form_lookup' && !!field.dataSource?.formId
  const lookupDisplayField = field.dataSource?.fieldKey || null

  const labelToValue = new Map<string, string>()
  const valueSet = new Set<string>()
  for (const o of normalized) {
    valueSet.add(o.value)
    labelToValue.set(o.label.toLowerCase(), o.value)
  }

  const resolvedValue = (() => {
    if (!value) return ""
    if (typeof value === 'object' && value?.id) return String(value.id)
    if (typeof value !== 'string') return String(value)
    if (valueSet.has(value)) return value
    return labelToValue.get(value.toLowerCase()) || ""
  })()

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </label>
      <Select
        value={resolvedValue}
        onValueChange={(selectedId) => {
          if (!selectedId) {
            onChange(null)
            return
          }
          if (isLookup) {
            onChange({ id: selectedId, displayField: lookupDisplayField })
            return
          }
          onChange(selectedId)
        }}
      >
        <SelectTrigger className="w-full bg-background dark:bg-background">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {normalized.map((o) => {
            return (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  )
}