import React from 'react'
import { Upload } from 'lucide-react'
import { Field } from './types'

interface FileFieldProps {
  field: Field
}

export default function FileField({ field }: FileFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </label>
      <div className="border-2 border-dashed border-input rounded-md p-6 text-center hover:bg-muted transition-colors cursor-pointer">
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
        <p className="text-xs text-muted-foreground mt-1">(File upload not implemented in MVP)</p>
      </div>
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  )
}