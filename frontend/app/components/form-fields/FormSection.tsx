import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Field } from './types'

interface FormSectionProps {
  section: Field | null
  fields: Field[]
  collapsed: boolean
  onToggle: () => void
  renderField: (field: Field) => React.ReactNode
}

export default function FormSection({ section, fields, collapsed, onToggle, renderField }: FormSectionProps) {
  return (
    <div>
      {/* Section Header */}
      {section && (
        <div
          className="flex items-center gap-2 py-3 mb-4 border-b-2 border-border cursor-pointer select-none"
          onClick={onToggle}
        >
          {collapsed ? (
            <ChevronRight size={20} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={20} className="text-muted-foreground" />
          )}
          <h3 className="text-lg font-semibold text-foreground">
            {section.label}
          </h3>
          {section.helpText && (
            <span className="text-sm text-muted-foreground ml-2">— {section.helpText}</span>
          )}
        </div>
      )}

      {/* Section Fields */}
      {(!section || !collapsed) && (
        <div className={`space-y-6 ${section ? 'pl-4 border-l-2 border-muted' : ''}`}>
          {fields.map(field => renderField(field))}
        </div>
      )}
    </div>
  )
}