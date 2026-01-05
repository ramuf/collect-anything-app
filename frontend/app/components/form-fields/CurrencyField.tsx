import React, { useMemo } from 'react'
import { Field } from './types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type CurrencyValue = {
  amount?: string | number | null
  currency?: string | null
}

interface CurrencyFieldProps {
  field: Field
  value: unknown
  onChange: (value: CurrencyValue | null) => void
}

function asString(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

export default function CurrencyField({ field, value, onChange }: CurrencyFieldProps) {
  const currencies = useMemo(() => {
    const opts = field.options && field.options.length > 0 ? field.options : ['USD', 'EUR', 'GBP']
    // unique + stable
    return Array.from(new Set(opts.map((c) => String(c).trim()).filter(Boolean)))
  }, [field.options])

  const currencyFromValue = (() => {
    if (value && typeof value === 'object') return asString((value as CurrencyValue).currency)
    return ''
  })()

  const amountFromValue = (() => {
    if (value && typeof value === 'object') return asString((value as CurrencyValue).amount)
    // If older data stored a plain string/number, treat it as the amount.
    if (typeof value === 'string' || typeof value === 'number') return asString(value)
    return ''
  })()

  const effectiveCurrency = currencyFromValue || field.defaultCurrency || currencies[0] || ''

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </label>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr]">
        <Select
          value={effectiveCurrency || undefined}
          onValueChange={(nextCurrency) => {
            const next: CurrencyValue = {
              currency: nextCurrency,
              amount: amountFromValue || ''
            }
            onChange(next)
          }}
        >
          <SelectTrigger className="w-full bg-background dark:bg-background">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          type="number"
          inputMode="decimal"
          required={field.required}
          placeholder={field.placeholder || '0.00'}
          min={typeof field.min === 'number' ? field.min : undefined}
          max={typeof field.max === 'number' ? field.max : undefined}
          step={typeof field.step === 'number' ? field.step : undefined}
          value={amountFromValue}
          onChange={(e) => {
            const nextAmount = e.target.value
            // Preserve currency even if user hasn't touched it yet.
            const next: CurrencyValue = {
              currency: effectiveCurrency || null,
              amount: nextAmount
            }
            onChange(next)
          }}
          className="w-full p-2.5 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring outline-none transition-all"
        />
      </div>

      {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
    </div>
  )
}
