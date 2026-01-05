import React from 'react'
import { Field } from './types'

interface TextFieldProps {
  field: Field
  value: any
  onChange: (value: any) => void
}

export default function TextField({ field, value, onChange }: TextFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </label>
      <input
        type="text"
        required={field.required}
        placeholder={field.placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2.5 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring outline-none transition-all"
      />
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  )
}