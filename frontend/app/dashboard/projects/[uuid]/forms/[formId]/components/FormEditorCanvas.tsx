'use client'

import React from 'react'
import {
  ArrowLeft, Upload, Link2, Calculator, GitBranch, LayoutList, Trash2, ChevronDown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface Form {
  id: string
  title: string
  slug: string
  project_id: string
  schema_: Field[]
  settings: any
}

interface Field {
  id: string
  type: string
  label: string
  key: string
  required: boolean
  placeholder?: string
  options?: string[]
  min?: number
  max?: number
  step?: number
  unit?: string
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
  sectionFields?: string[]
}

interface FormEditorCanvasProps {
  form: Form | null
  selectedFieldId: string | null
  setSelectedFieldId: (id: string | null) => void
  moveField: (index: number, direction: 'up' | 'down') => void
  deleteField: (id: string) => void
  projectForms: Form[]
}

function FieldRenderer({ field, index, selectedFieldId, setSelectedFieldId, moveField, deleteField, projectForms }: {
  field: Field
  index: number
  selectedFieldId: string | null
  setSelectedFieldId: (id: string | null) => void
  moveField: (index: number, direction: 'up' | 'down') => void
  deleteField: (id: string) => void
  projectForms: Form[]
}) {
  return (
    <div
      onClick={() => setSelectedFieldId(field.id)}
      className={`relative group p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedFieldId === field.id
        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
        : 'border-transparent hover:border-[var(--border)]'
        }`}
    >
      {/* Field Controls */}
      <div className={`absolute right-2 top-2 flex gap-1 ${selectedFieldId === field.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
        <button
          onClick={(e) => { e.stopPropagation(); moveField(index, 'up') }}
          disabled={index === 0}
          className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30"
        >
          <ArrowLeft size={14} className="rotate-90" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); moveField(index, 'down') }}
          disabled={false} // Will be set by parent
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30"
        >
          <ArrowLeft size={14} className="-rotate-90" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); deleteField(field.id) }}
          className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Field Render */}
      <div className="pointer-events-none">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          {field.label} {field.required && <span className="text-[var(--destructive)]">*</span>}
        </label>

        {field.type === 'text' && (
          <input type="text" className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)]" placeholder={field.placeholder} disabled />
        )}

        {field.type === 'textarea' && (
          <textarea className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)] h-24" placeholder={field.placeholder} disabled />
        )}

        {field.type === 'number' && (
          <input type="number" className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)]" placeholder={field.placeholder} disabled />
        )}

        {field.type === 'currency' && (
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <button disabled className="w-full flex items-center justify-between p-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]">
              <span>{field.defaultCurrency || field.options?.[0] || 'USD'}</span>
              <ChevronDown className="size-4 text-[var(--muted-foreground)]" />
            </button>
            <input type="number" className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)]" placeholder={field.placeholder || '0.00'} disabled />
          </div>
        )}

        {field.type === 'date' && (
          <input type="date" className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)]" disabled />
        )}

        {field.type === 'time' && (
          <input type="time" className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)]" disabled />
        )}

        {field.type === 'rating' && (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: Math.max(1, Math.min(10, Math.floor(field.max ?? 5))) }, (_, i) => i + 1).map((n) => (
              <div key={n} className="w-9 h-9 rounded-md border border-[var(--border)] bg-[var(--background)] flex items-center justify-center text-sm text-[var(--muted-foreground)]">
                {n}
              </div>
            ))}
          </div>
        )}

        {field.type === 'slider' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>{typeof field.min === 'number' ? field.min : 0}{field.unit ? ` ${field.unit}` : ''}</span>
              <span>{typeof field.max === 'number' ? field.max : 100}{field.unit ? ` ${field.unit}` : ''}</span>
            </div>
            <input type="range" className="w-full" min={typeof field.min === 'number' ? field.min : 0} max={typeof field.max === 'number' ? field.max : 100} step={typeof field.step === 'number' ? field.step : 1} disabled />
          </div>
        )}

        {field.type === 'select' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button disabled className="w-full flex items-center justify-between p-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]">
                <span>Select an option</span>
                <ChevronDown className="size-4 text-[var(--muted-foreground)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {field.dataSource?.type === 'form_lookup' ? (
                <DropdownMenuItem>Dynamic options from another form</DropdownMenuItem>
              ) : (
                field.options?.map(opt => <DropdownMenuItem key={opt}>{opt}</DropdownMenuItem>)
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {(field.type === 'radio' || field.type === 'checkbox') && (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type={field.type === 'radio' ? 'radio' : 'checkbox'} disabled className="rounded border-[var(--border)]" />
                <span className="text-sm text-[var(--foreground)]">{opt}</span>
              </div>
            ))}
          </div>
        )}

        {field.type === 'toggle' && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-6 bg-[var(--muted)] rounded-full relative">
              <div className="absolute left-1 top-1 w-4 h-4 bg-[var(--card)] rounded-full shadow-sm"></div>
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">{field.placeholder || 'Toggle me'}</span>
          </div>
        )}

        {field.type === 'file' && (
          <div className="border-2 border-dashed border-[var(--border)] rounded-md p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-[var(--muted-foreground)] mb-2" />
            <p className="text-sm text-[var(--muted-foreground)]">Click to upload or drag and drop</p>
          </div>
        )}

        {field.type === 'reference' && (
          <div className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)] flex items-center justify-between text-[var(--muted-foreground)]">
            <span>
              {field.targetFormId
                ? `Linked to: ${projectForms.find(f => f.id === field.targetFormId)?.title || 'Unknown Form'}${field.displayFieldKey ? ` (showing ${field.displayFieldKey})` : ''}`
                : 'Select a form to link...'}
            </span>
            <Link2 size={16} />
          </div>
        )}

        {field.type === 'multiselect' && (
          <div className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)]">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {field.options?.slice(0, 2).map((opt, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                  {opt}
                </span>
              ))}
              {(field.options?.length || 0) > 2 && (
                <span className="text-xs text-[var(--muted-foreground)]">+{(field.options?.length || 0) - 2} more</span>
              )}
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">Click to select multiple options</p>
          </div>
        )}

        {field.type === 'calculated' && (
          <div className="w-full p-3 rounded-md border border-dashed border-[var(--primary)]/50 bg-[var(--primary)]/5">
            <div className="flex items-center gap-2 text-[var(--primary)]">
              <Calculator size={16} />
              <span className="text-sm font-medium">Calculated Field</span>
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)] font-mono">
              {field.formula || 'No formula set'}
            </p>
          </div>
        )}

        {field.type === 'conditional' && (
          <div className="w-full p-3 rounded-md border border-dashed border-amber-500/50 bg-amber-500/5">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <GitBranch size={16} />
              <span className="text-sm font-medium">Conditional Field</span>
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {field.conditions?.[0]?.fieldKey
                ? `${field.conditions[0].action === 'show' ? 'Show' : 'Hide'} when ${field.conditions[0].fieldKey} ${field.conditions[0].operator.replace('_', ' ')} ${field.conditions[0].value || '...'}` : 'No conditions set'}
            </p>
            <input type="text" className="w-full mt-2 p-2 rounded-md border border-[var(--border)] bg-[var(--background)]" placeholder={field.placeholder} disabled />
          </div>
        )}

        {field.type === 'section' && (
          <div className="w-full -mx-4 -mt-4 -mb-4 p-4 rounded-lg bg-[var(--muted)]/50 border-l-4 border-[var(--primary)]">
            <div className="flex items-center gap-2">
              <LayoutList size={16} className="text-[var(--primary)]" />
              <span className="text-sm font-semibold text-[var(--foreground)]">{field.label}</span>
            </div>
            {field.helpText && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{field.helpText}</p>
            )}
            <p className="mt-2 text-xs text-[var(--muted-foreground)] italic">Group related fields below this section</p>
          </div>
        )}

        {field.helpText && field.type !== 'section' && (
          <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">{field.helpText}</p>
        )}
      </div>
    </div>
  )
}

export default function FormEditorCanvas({ form, selectedFieldId, setSelectedFieldId, moveField, deleteField, projectForms }: FormEditorCanvasProps) {
  if (!form) return null

  return (
    <div className="flex-1 bg-[var(--background)] overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] min-h-[500px] p-8">
        <div className="mb-8 border-b border-[var(--border)] pb-6">
          <h2 className="text-3xl font-bold text-[var(--foreground)]">{form.title}</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">This is how your form will look to users.</p>
        </div>

        {form.schema_.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-lg">
            <p className="text-[var(--muted-foreground)]">Your form is empty.</p>
            <p className="text-sm text-[var(--muted-foreground)] opacity-70 mt-1">Click an element from the sidebar to add it.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {form.schema_.map((field, index) => (
              <FieldRenderer
                key={field.id}
                field={field}
                index={index}
                selectedFieldId={selectedFieldId}
                setSelectedFieldId={setSelectedFieldId}
                moveField={moveField}
                deleteField={deleteField}
                projectForms={projectForms}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}