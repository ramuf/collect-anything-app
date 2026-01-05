import React from 'react'
import { Field } from './types'

interface ToggleFieldProps {
  field: Field
  value: any
  onChange: (value: any) => void
}

export default function ToggleField({ field, value, onChange }: ToggleFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </label>
      <label className="flex items-center gap-3 cursor-pointer pt-1">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer bg-muted peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-border peer-checked:bg-primary"></div>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {field.placeholder || 'Yes'}
        </span>
      </label>
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  )
}