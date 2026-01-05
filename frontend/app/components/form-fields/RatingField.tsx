import React, { useMemo } from 'react'
import { Field } from './types'

interface RatingFieldProps {
  field: Field
  value: unknown
  onChange: (value: number | null) => void
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export default function RatingField({ field, value, onChange }: RatingFieldProps) {
  const max = useMemo(() => {
    const configured = typeof field.max === 'number' ? field.max : 5
    return clamp(Math.floor(configured), 1, 10)
  }, [field.max])

  const current = typeof value === 'number' ? value : (typeof value === 'string' && value !== '' ? Number(value) : null)

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </label>

      <div className="flex flex-wrap gap-2 pt-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const checked = current === n
          return (
            <label
              key={n}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-md border cursor-pointer select-none transition-colors ${
                checked
                  ? 'border-ring bg-muted'
                  : 'border-input bg-background hover:bg-muted'
              }`}
            >
              <input
                type="radio"
                name={field.key}
                value={n}
                required={field.required}
                checked={checked}
                onChange={() => onChange(n)}
                className="sr-only"
              />
              <span className="text-sm text-foreground">{n}</span>
            </label>
          )
        })}

        {!field.required && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
    </div>
  )
}
