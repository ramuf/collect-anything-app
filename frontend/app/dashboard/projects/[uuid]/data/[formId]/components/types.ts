export interface FormField {
  id: string
  type: string
  label: string
  key: string
  required: boolean
  placeholder?: string
  options?: string[]
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

export interface Form {
  id: string
  title: string
  slug: string
  schema_: FormField[]
}

export interface Submission {
  id: string
  form_id: string
  data: Record<string, any>
  created_at: string
}

// Cache for reference data: { targetFormId: { submissionId: submissionData } }
export type ReferenceCache = Record<string, Record<string, Record<string, any>>>

export type SortDirection = 'asc' | 'desc' | null

export interface SortConfig {
  key: string
  direction: SortDirection
}