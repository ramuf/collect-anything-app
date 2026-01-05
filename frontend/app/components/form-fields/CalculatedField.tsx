import { Field } from './types'

interface CalculatedFieldProps {
  field: Field
  value: any
}

export default function CalculatedField({ field, value }: CalculatedFieldProps) {
  return (
    <div className="p-4 rounded-md bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{field.label}</span>
        <span className="text-lg font-bold text-primary">
          {typeof value === 'number'
            ? value.toLocaleString()
            : value || '—'}
        </span>
      </div>
      {field.helpText && (
        <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
      )}
    </div>
  )
}