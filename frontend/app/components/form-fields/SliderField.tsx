import React, { useEffect, useMemo } from 'react'
import { Field } from './types'

interface SliderFieldProps {
  field: Field
  value: unknown
  onChange: (value: number | null) => void
}

export default function SliderField({ field, value, onChange }: SliderFieldProps) {
  const min = useMemo(() => (typeof field.min === 'number' ? field.min : 0), [field.min])
  const max = useMemo(() => (typeof field.max === 'number' ? field.max : 100), [field.max])
  const step = useMemo(() => (typeof field.step === 'number' ? field.step : 1), [field.step])

  const current = (() => {
    if (typeof value === 'number') return value
    if (typeof value === 'string' && value !== '') {
      const n = Number(value)
      return Number.isFinite(n) ? n : min
    }
    return min
  })()

  // Range sliders always have a value; initialize form state so required validation works.
  useEffect(() => {
    if (value === null || value === undefined || value === '') {
      onChange(min)
    }
  }, [value, min, onChange])

  const unit = field.unit ? String(field.unit) : ''

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </label>

      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{min}{unit ? ` ${unit}` : ''}</span>
          <span className="text-foreground font-medium">{current}{unit ? ` ${unit}` : ''}</span>
          <span>{max}{unit ? ` ${unit}` : ''}</span>
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          required={field.required}
          value={current}
          onChange={(e) => {
            const n = Number(e.target.value)
            onChange(Number.isFinite(n) ? n : null)
          }}
          className="w-full"
        />
      </div>

      {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
    </div>
  )
}
