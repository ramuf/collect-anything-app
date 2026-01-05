import React from 'react'
import { DatePicker } from '@/components/ui/date-picker'
import { Field } from './types'

// Wrapper component for DatePicker that handles string/Date conversion
function DatePickerWithState({ value, onChange, placeholder, required }: {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}) {
  // Convert string value to Date object
  const dateValue = React.useMemo(() => {
    if (!value) return undefined
    const date = new Date(value)
    return isNaN(date.getTime()) ? undefined : date
  }, [value])

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Convert Date object back to ISO string (YYYY-MM-DD)
      onChange(date.toISOString().split('T')[0])
    } else {
      onChange('')
    }
  }

  return (
    <DatePicker
      date={dateValue}
      setDate={handleDateChange}
      placeholder={placeholder}
      required={required}
    />
  )
}

interface DateFieldProps {
  field: Field
  value: any
  onChange: (value: any) => void
}

export default function DateField({ field, value, onChange }: DateFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </label>
      <DatePickerWithState
        value={value}
        onChange={onChange}
        placeholder={field.placeholder || 'Pick a date'}
        required={field.required}
      />
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  )
}