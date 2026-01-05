export interface Field {
  id: string
  type: string
  label: string
  key: string
  required: boolean
  placeholder?: string
  options?: string[]
  // Numeric-style configuration (used by slider, rating, currency, etc.)
  min?: number
  max?: number
  step?: number
  unit?: string
  // Currency field configuration
  defaultCurrency?: string
  helpText?: string
  targetFormId?: string
  displayFieldKey?: string
  dataSource?: {
    type: 'static' | 'form_lookup'
    formId?: string
    fieldKey?: string
  }
  formula?: string
  conditions?: {
    fieldKey: string
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
    value?: string | number | boolean
    action: 'show' | 'hide'
  }[]
  collapsed?: boolean
}

export type OptionItem = {
  value: string
  label: string
}