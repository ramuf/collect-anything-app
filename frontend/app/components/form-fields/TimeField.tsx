import React from 'react'
import { TimePicker } from '@/components/ui/time-picker'
import { Field } from './types'

interface TimeFieldProps {
  field: Field
  value: any
  onChange: (value: any) => void
}

export default function TimeField({ field, value, onChange }: TimeFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </label>
      <TimePicker
        value={value || ''}
        onChange={onChange}
        placeholder={field.placeholder || 'Pick a time'}
        required={field.required}
      />
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  )
}