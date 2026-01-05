import React from 'react'
import { Field } from './types'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

interface ReferenceFieldProps {
  field: Field
  value: unknown
  onChange: (value: unknown) => void
  referenceOptions?: {id: string, label: string}[]
}

export default function ReferenceField({ field, value, onChange, referenceOptions }: ReferenceFieldProps) {
  const selectedId = typeof value === 'object' ? (value as any)?.id : value
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </label>
      <Select
        value={selectedId || ''}
        onValueChange={(selectedId) => {
          if (!selectedId) {
            onChange(null)
            return
          }
          // Store references as the referenced submission ID.
          // (We still accept legacy object-shaped values when reading.)
          onChange(selectedId)
        }}
      >
        <SelectTrigger className="w-full bg-background dark:bg-background">
          <SelectValue placeholder="Select a submission" />
        </SelectTrigger>
        <SelectContent>
          {referenceOptions?.map(opt => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  )
}