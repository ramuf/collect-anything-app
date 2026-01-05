import { useMemo } from 'react'
import { Field } from '../form-fields/types'

export function useFieldVisibility(formData: Record<string, any>, schema: Field[], calculatedValues: Record<string, any>) {
  return useMemo(() => {
    const visibility: Record<string, boolean> = {}
    schema.forEach(field => {
      if (field.type === 'conditional' && field.conditions?.length) {
        // All conditions must be met (AND logic)
        const allConditionsMet = field.conditions.every(condition => {
          // Prefer explicit user-entered values, fall back to calculated values
          const fieldValue = formData[condition.fieldKey] ?? calculatedValues[condition.fieldKey]
          let conditionMet = false

          switch (condition.operator) {
            case 'equals':
              conditionMet = String(fieldValue) === String(condition.value)
              break
            case 'not_equals':
              conditionMet = String(fieldValue) !== String(condition.value)
              break
            case 'contains':
              conditionMet = String(fieldValue || '').toLowerCase().includes(String(condition.value || '').toLowerCase())
              break
            case 'greater_than':
              conditionMet = Number(fieldValue) > Number(condition.value)
              break
            case 'less_than':
              conditionMet = Number(fieldValue) < Number(condition.value)
              break
            case 'is_empty':
              conditionMet = fieldValue === undefined || fieldValue === null || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0)
              break
            case 'is_not_empty':
              conditionMet = fieldValue !== undefined && fieldValue !== null && fieldValue !== '' && !(Array.isArray(fieldValue) && fieldValue.length === 0)
              break
          }

          return condition.action === 'show' ? conditionMet : !conditionMet
        })
        visibility[field.id] = allConditionsMet
      } else {
        visibility[field.id] = true
      }
    })
    return visibility
  }, [formData, schema, calculatedValues])
}