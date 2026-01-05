import { useMemo } from 'react'
import { Field } from '../form-fields/types'

export function useCalculatedValues(formData: Record<string, any>, schema: Field[]) {
  return useMemo(() => {
    const values: Record<string, number | string> = {}

    // Helper functions for date calculations
    const today = new Date()

    const parseDate = (value: any): Date | null => {
      if (!value) return null
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date
    }

    const yearsBetween = (date1: Date, date2: Date): number => {
      let years = date2.getFullYear() - date1.getFullYear()
      const monthDiff = date2.getMonth() - date1.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && date2.getDate() < date1.getDate())) {
        years--
      }
      return years
    }

    const daysBetween = (date1: Date, date2: Date): number => {
      const msPerDay = 1000 * 60 * 60 * 24
      return Math.floor((date2.getTime() - date1.getTime()) / msPerDay)
    }

    const monthsBetween = (date1: Date, date2: Date): number => {
      let months = (date2.getFullYear() - date1.getFullYear()) * 12
      months += date2.getMonth() - date1.getMonth()
      if (date2.getDate() < date1.getDate()) {
        months--
      }
      return months
    }

    schema.filter(f => f.type === 'calculated' && f.formula).forEach(field => {
      try {
        let formula = field.formula || ''

        // Process date functions first
        // AGE({date_field}) or YEARS_SINCE({date_field}) - returns years from date to today
        formula = formula.replace(/AGE\(\{([^}]+)\}\)/gi, (_, key) => {
          const date = parseDate(formData[key])
          if (!date) return '0'
          return String(yearsBetween(date, today))
        })

        formula = formula.replace(/YEARS_SINCE\(\{([^}]+)\}\)/gi, (_, key) => {
          const date = parseDate(formData[key])
          if (!date) return '0'
          return String(yearsBetween(date, today))
        })

        // MONTHS_SINCE({date_field}) - returns months from date to today
        formula = formula.replace(/MONTHS_SINCE\(\{([^}]+)\}\)/gi, (_, key) => {
          const date = parseDate(formData[key])
          if (!date) return '0'
          return String(monthsBetween(date, today))
        })

        // DAYS_SINCE({date_field}) - returns days from date to today
        formula = formula.replace(/DAYS_SINCE\(\{([^}]+)\}\)/gi, (_, key) => {
          const date = parseDate(formData[key])
          if (!date) return '0'
          return String(daysBetween(date, today))
        })

        // YEAR({date_field}) - extracts year from a date
        formula = formula.replace(/YEAR\(\{([^}]+)\}\)/gi, (_, key) => {
          const date = parseDate(formData[key])
          if (!date) return '0'
          return String(date.getFullYear())
        })

        // MONTH({date_field}) - extracts month (1-12) from a date
        formula = formula.replace(/MONTH\(\{([^}]+)\}\)/gi, (_, key) => {
          const date = parseDate(formData[key])
          if (!date) return '0'
          return String(date.getMonth() + 1)
        })

        // DAY({date_field}) - extracts day of month from a date
        formula = formula.replace(/DAY\(\{([^}]+)\}\)/gi, (_, key) => {
          const date = parseDate(formData[key])
          if (!date) return '0'
          return String(date.getDate())
        })

        // Replace remaining {field_key} with numeric values
        const matches = formula.match(/\{([^}]+)\}/g) || []
        matches.forEach(match => {
          const key = match.slice(1, -1)
          const val = formData[key]
          const numVal = typeof val === 'number' ? val : parseFloat(val) || 0
          formula = formula.replace(match, String(numVal))
        })

        // Safely evaluate the formula (only allow numbers and basic operators)
        if (/^[\d\s+\-*/().]+$/.test(formula)) {
          const result = Function(`"use strict"; return (${formula})`)()
          values[field.key] = typeof result === 'number' && !isNaN(result) ? result : 'Error'
        } else {
          values[field.key] = 'Invalid formula'
        }
      } catch {
        values[field.key] = 'Error'
      }
    })
    return values
  }, [formData, schema])
}