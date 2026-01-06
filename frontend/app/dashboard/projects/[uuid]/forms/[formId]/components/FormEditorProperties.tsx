'use client'

import React from 'react'
import {
  Settings, Plus, Trash2, ChevronDown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

const TYPE_LABELS: Record<string, string> = {
  text: 'Short Text',
  textarea: 'Long Text',
  number: 'Number',
  currency: 'Currency',
  date: 'Date',
  time: 'Time',
  rating: 'Rating',
  slider: 'Slider',
  select: 'Dropdown',
  multiselect: 'Multi-Select',
  radio: 'Single Choice',
  checkbox: 'Multiple Choice',
  toggle: 'Switch',
  file: 'File',
  reference: 'Reference',
  calculated: 'Calculated',
  conditional: 'Conditional',
  section: 'Section',
}
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

interface FormEditorPropertiesProps {
  selectedField: Field | undefined
  updateField: (id: string, updates: Partial<Field>) => void
  deleteField: (id: string) => void
  form: Form | null
  projectForms: Form[]
  targetFormSchemas: Record<string, Field[]>
  fetchTargetFormSchema: (targetFormId: string) => void
}

export default function FormEditorProperties({
  selectedField,
  updateField,
  deleteField,
  form,
  projectForms,
  targetFormSchemas,
  fetchTargetFormSchema
}: FormEditorPropertiesProps) {
  if (!selectedField) {
    return (
      <div className="w-80 border-l border-[var(--border)] bg-[var(--card)] flex flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)] text-center p-4">
              <Settings className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">Select a field to edit its properties</p>
            </div>
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="w-80 border-l border-[var(--border)] bg-[var(--card)] flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Field Properties</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">{TYPE_LABELS[selectedField.type] ?? selectedField.type}</span>
              </div>
              <button onClick={() => deleteField(selectedField.id)} className="text-[var(--destructive)] hover:opacity-80 text-xs">Delete</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Label</label>
                <input
                  type="text"
                  value={selectedField.label}
                  onChange={(e) => updateField(selectedField.id, { label: e.target.value, key: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') })}
                  className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Field Key (Internal ID)</label>
                <input
                  type="text"
                  value={selectedField.key}
                  onChange={(e) => updateField(selectedField.id, { key: e.target.value })}
                  className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--muted)] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Placeholder</label>
                <input
                  type="text"
                  value={selectedField.placeholder || ''}
                  onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                  className="w-full p-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Help Text</label>
                <input
                  type="text"
                  value={selectedField.helpText || ''}
                  onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })}
                  className="w-full p-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedField.required}
                  onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                  className="rounded border-[var(--border)]"
                />
                <label htmlFor="required" className="text-sm text-[var(--foreground)]">Required Field</label>
              </div>

              {selectedField.type === 'currency' && (
                <div className="pt-4 border-t border-[var(--border)] space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Currencies (comma-separated)</label>
                    <input
                      type="text"
                      value={(selectedField.options && selectedField.options.length > 0 ? selectedField.options : ['USD', 'EUR', 'GBP']).join(', ')}
                      onChange={(e) => {
                        const next = e.target.value
                          .split(',')
                          .map(s => s.trim())
                          .filter(Boolean)

                        const options = next.length > 0 ? Array.from(new Set(next)) : ['USD']
                        const defaultCurrency = selectedField.defaultCurrency && options.includes(selectedField.defaultCurrency)
                          ? selectedField.defaultCurrency
                          : options[0]
                        updateField(selectedField.id, { options, defaultCurrency })
                      }}
                      className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                    />
                    <p className="text-xs text-[var(--muted-foreground)] opacity-70 mt-1">Example: USD, EUR, GBP</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Default Currency</label>
                      <input
                        type="text"
                        value={selectedField.defaultCurrency || (selectedField.options?.[0] || 'USD')}
                        onChange={(e) => updateField(selectedField.id, { defaultCurrency: e.target.value.toUpperCase() })}
                        className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Step</label>
                      <input
                        type="number"
                        value={typeof selectedField.step === 'number' ? selectedField.step : 0.01}
                        onChange={(e) => updateField(selectedField.id, { step: e.target.value === '' ? undefined : Number(e.target.value) })}
                        className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Min (optional)</label>
                      <input
                        type="number"
                        value={typeof selectedField.min === 'number' ? selectedField.min : ''}
                        onChange={(e) => updateField(selectedField.id, { min: e.target.value === '' ? undefined : Number(e.target.value) })}
                        className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Max (optional)</label>
                      <input
                        type="number"
                        value={typeof selectedField.max === 'number' ? selectedField.max : ''}
                        onChange={(e) => updateField(selectedField.id, { max: e.target.value === '' ? undefined : Number(e.target.value) })}
                        className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedField.type === 'rating' && (
                <div className="pt-4 border-t border-[var(--border)] space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Max rating</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={typeof selectedField.max === 'number' ? selectedField.max : 5}
                      onChange={(e) => updateField(selectedField.id, { max: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                    />
                    <p className="text-xs text-[var(--muted-foreground)] opacity-70 mt-1">1–10 (default 5)</p>
                  </div>
                </div>
              )}

              {selectedField.type === 'slider' && (
                <div className="pt-4 border-t border-[var(--border)] space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Min</label>
                      <input
                        type="number"
                        value={typeof selectedField.min === 'number' ? selectedField.min : 0}
                        onChange={(e) => updateField(selectedField.id, { min: e.target.value === '' ? undefined : Number(e.target.value) })}
                        className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Max</label>
                      <input
                        type="number"
                        value={typeof selectedField.max === 'number' ? selectedField.max : 100}
                        onChange={(e) => updateField(selectedField.id, { max: e.target.value === '' ? undefined : Number(e.target.value) })}
                        className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Step</label>
                      <input
                        type="number"
                        value={typeof selectedField.step === 'number' ? selectedField.step : 1}
                        onChange={(e) => updateField(selectedField.id, { step: e.target.value === '' ? undefined : Number(e.target.value) })}
                        className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Unit (optional)</label>
                    <input
                      type="text"
                      value={selectedField.unit || ''}
                      onChange={(e) => updateField(selectedField.id, { unit: e.target.value })}
                      className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                    />
                    <p className="text-xs text-[var(--muted-foreground)] opacity-70 mt-1">Example: %, kg, hrs</p>
                  </div>
                </div>
              )}

              {selectedField.type === 'reference' && (
                <div className="pt-4 border-t border-[var(--border)] space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2">Target Form</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full flex items-center justify-between p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)]">
                          <span className="text-sm text-[var(--foreground)]">{projectForms.find(f => f.id === selectedField.targetFormId)?.title || 'Select a form...'}</span>
                          <ChevronDown className="ml-2 size-4 text-[var(--muted-foreground)]" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuRadioGroup value={selectedField.targetFormId || ''} onValueChange={(val) => {
                          const newTargetFormId = val || undefined
                          updateField(selectedField.id, {
                            targetFormId: newTargetFormId,
                            displayFieldKey: undefined,
                          })
                          if (newTargetFormId) fetchTargetFormSchema(newTargetFormId)
                        }}>
                          <DropdownMenuRadioItem value="">None</DropdownMenuRadioItem>
                          {projectForms.map(f => (
                            <DropdownMenuRadioItem key={f.id} value={f.id}>{f.title}</DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-xs text-[var(--muted-foreground)] opacity-70 mt-1">
                      Users will select a submission from this form.
                    </p>
                  </div>

                  {selectedField.targetFormId && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2">Display Field</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button onFocus={() => {
                            if (selectedField.targetFormId && !targetFormSchemas[selectedField.targetFormId]) {
                              fetchTargetFormSchema(selectedField.targetFormId)
                            }
                          }} className="w-full flex items-center justify-between p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)]">
                            <span className="text-sm text-[var(--foreground)]">{selectedField.displayFieldKey ? `${selectedField.displayFieldKey}` : 'Auto (first text field)'}</span>
                            <ChevronDown className="ml-2 size-4 text-[var(--muted-foreground)]" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuRadioGroup value={selectedField.displayFieldKey || ''} onValueChange={(val) => updateField(selectedField.id, { displayFieldKey: val || undefined })}>
                            <DropdownMenuRadioItem value="">Auto (first text field)</DropdownMenuRadioItem>
                            {targetFormSchemas[selectedField.targetFormId]?.map(f => (
                              <DropdownMenuRadioItem key={f.key} value={f.key}>{f.label} ({f.key})</DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <p className="text-xs text-[var(--muted-foreground)] opacity-70 mt-1">
                        Which field to show when selecting a reference.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(selectedField.type === 'select' || selectedField.type === 'radio' || selectedField.type === 'checkbox' || selectedField.type === 'multiselect') && (
                <div className="pt-4 border-t border-[var(--border)]">
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2">Options</label>

                  <div className="space-y-3">
                    {/* Source selector: static or form lookup */}
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2">Source</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-full flex items-center justify-between p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)]">
                            <span className="text-sm text-[var(--foreground)]">{selectedField.dataSource?.type === 'form_lookup' ? 'Form (dynamic)' : 'Static options'}</span>
                            <ChevronDown className="ml-2 size-4 text-[var(--muted-foreground)]" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuRadioGroup value={selectedField.dataSource?.type || 'static'} onValueChange={(val) => {
                            if (val === 'form_lookup') {
                              updateField(selectedField.id, { dataSource: { type: 'form_lookup', formId: undefined, fieldKey: undefined } })
                            } else {
                              updateField(selectedField.id, { dataSource: { type: 'static' } })
                            }
                          }}>
                            <DropdownMenuRadioItem value="static">Static options</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="form_lookup">Choices from another form</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* If using form lookup, show form and field pickers */}
                    {selectedField.dataSource?.type === 'form_lookup' ? (
                      <div className="space-y-3 p-3 bg-[var(--primary)]/10 rounded-md border border-[var(--primary)]/20">
                        <p className="text-xs text-[var(--primary)] font-medium mb-1">Dynamic Data Source</p>

                        <div>
                          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2">Source Form</label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="w-full flex items-center justify-between p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)]" onFocus={() => { /* noop */ }}>
                                <span className="text-sm text-[var(--foreground)]">{projectForms.find(f => f.id === selectedField.dataSource?.formId)?.title || 'Select a form...'}</span>
                                <ChevronDown className="ml-2 size-4 text-[var(--muted-foreground)]" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuRadioGroup value={selectedField.dataSource?.formId || ''} onValueChange={(val) => {
                                const newFormId = val || undefined
                                updateField(selectedField.id, { dataSource: { type: 'form_lookup', formId: newFormId, fieldKey: undefined } })
                                if (newFormId) fetchTargetFormSchema(newFormId)
                              }}>
                                <DropdownMenuRadioItem value="">None</DropdownMenuRadioItem>
                                {projectForms.map(f => (
                                  <DropdownMenuRadioItem key={f.id} value={f.id}>{f.title}</DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {selectedField.dataSource?.formId && (
                          <div>
                            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2">Source Field</label>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="w-full flex items-center justify-between p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)]" onFocus={() => {
                                  if (selectedField.dataSource?.formId && !targetFormSchemas[selectedField.dataSource.formId]) {
                                    fetchTargetFormSchema(selectedField.dataSource.formId)
                                  }
                                }}>
                                  <span className="text-sm text-[var(--foreground)]">{selectedField.dataSource?.fieldKey ? `${selectedField.dataSource.fieldKey}` : 'Select a field...'}</span>
                                  <ChevronDown className="ml-2 size-4 text-[var(--muted-foreground)]" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuRadioGroup value={selectedField.dataSource?.fieldKey || ''} onValueChange={(val) => updateField(selectedField.id, { dataSource: { ...(selectedField.dataSource || { type: 'form_lookup' }), fieldKey: val || undefined } })}>
                                  <DropdownMenuRadioItem value="">Select a field...</DropdownMenuRadioItem>
                                  {targetFormSchemas[selectedField.dataSource.formId]?.map(f => (
                                    <DropdownMenuRadioItem key={f.key} value={f.key}>{f.label} ({f.key})</DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <p className="text-xs text-[var(--muted-foreground)] opacity-70 mt-1">Field whose values will be used as options.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedField.options?.map((opt, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOptions = [...(selectedField.options || [])]
                                newOptions[idx] = e.target.value
                                updateField(selectedField.id, { options: newOptions })
                              }}
                              className="flex-1 p-1.5 text-sm rounded-md border border-[var(--border)] bg-[var(--background)]"
                            />
                            <button
                              onClick={() => {
                                const newOptions = selectedField.options?.filter((_, i) => i !== idx)
                                updateField(selectedField.id, { options: newOptions })
                              }}
                              className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newOptions = [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`]
                            updateField(selectedField.id, { options: newOptions })
                          }}
                          className="flex items-center gap-1 text-xs text-[var(--primary)] hover:opacity-80 font-medium mt-2"
                        >
                          <Plus size={12} /> Add Option
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              

              {/* Calculated Field Properties */}
              {selectedField.type === 'calculated' && (
                <div className="pt-4 border-t border-[var(--border)] space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2">
                      Formula
                    </label>
                    <textarea
                      value={selectedField.formula || ''}
                      onChange={(e) => updateField(selectedField.id, { formula: e.target.value })}
                      placeholder="AGE({birth_date}) or {price} * {quantity}"
                      className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] font-mono h-20"
                    />
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      Use {'{field_key}'} for values. Supports: +, -, *, /, (, )
                    </p>
                  </div>

                  {/* Date Functions */}
                  <div className="p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">Date Functions:</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {['AGE', 'YEARS_SINCE', 'MONTHS_SINCE', 'DAYS_SINCE', 'YEAR', 'MONTH', 'DAY'].map(fn => (
                        <button
                          key={fn}
                          type="button"
                          onClick={() => {
                            const current = selectedField.formula || ''
                            updateField(selectedField.id, { formula: current + `${fn}({})` })
                          }}
                          className="px-2 py-0.5 text-xs bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded hover:border-amber-500 transition-colors font-mono"
                        >
                          {fn}()
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                      Example: <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">AGE({'{birth_date}'})</code> calculates years from date to today
                    </p>
                  </div>

                  {/* Date Fields */}
                  {form && form.schema_.filter(f => f.type === 'date' && f.id !== selectedField.id).length > 0 && (
                    <div className="p-3 bg-[var(--muted)]/50 rounded-md">
                      <p className="text-xs font-medium text-[var(--muted-foreground)] mb-2">Date Fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {form.schema_.filter(f => f.type === 'date' && f.id !== selectedField.id).map(f => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                              const current = selectedField.formula || ''
                              updateField(selectedField.id, { formula: current + `{${f.key}}` })
                            }}
                            className="px-2 py-0.5 text-xs bg-[var(--background)] border border-[var(--border)] rounded hover:border-[var(--primary)] transition-colors"
                          >
                            📅 {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Number Fields */}
                  {form && form.schema_.filter(f => f.type === 'number' && f.id !== selectedField.id).length > 0 && (
                    <div className="p-3 bg-[var(--muted)]/50 rounded-md">
                      <p className="text-xs font-medium text-[var(--muted-foreground)] mb-2">Number Fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {form.schema_.filter(f => f.type === 'number' && f.id !== selectedField.id).map(f => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                              const current = selectedField.formula || ''
                              updateField(selectedField.id, { formula: current + `{${f.key}}` })
                            }}
                            className="px-2 py-0.5 text-xs bg-[var(--background)] border border-[var(--border)] rounded hover:border-[var(--primary)] transition-colors"
                          >
                            # {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Conditional Field Properties */}
              {selectedField.type === 'conditional' && (
                <div className="pt-4 border-t border-[var(--border)] space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2">
                      Visibility Conditions
                    </label>
                    {selectedField.conditions?.map((condition, idx) => (
                      <div key={idx} className="space-y-2 p-3 bg-[var(--muted)]/30 rounded-md mb-2">
                        <div className="flex gap-2 items-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 text-xs rounded border border-[var(--border)] bg-[var(--background)]">
                                {condition.action === 'show' ? 'Show' : 'Hide'}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuRadioGroup value={condition.action} onValueChange={(val) => {
                                const newConditions = [...(selectedField.conditions || [])]
                                newConditions[idx] = { ...condition, action: val as 'show' | 'hide' }
                                updateField(selectedField.id, { conditions: newConditions })
                              }}>
                                <DropdownMenuRadioItem value="show">Show</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="hide">Hide</DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <span className="text-xs text-[var(--muted-foreground)]">this field when</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-full text-left p-1.5 text-xs rounded border border-[var(--border)] bg-[var(--background)]">
                              {condition.fieldKey ? `${condition.fieldKey}` : 'Select a field...'}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuRadioGroup value={condition.fieldKey || ''} onValueChange={(val) => {
                              const newConditions = [...(selectedField.conditions || [])]
                              newConditions[idx] = { ...condition, fieldKey: val }
                              updateField(selectedField.id, { conditions: newConditions })
                            }}>
                              <DropdownMenuRadioItem value="">Select a field...</DropdownMenuRadioItem>
                              {form?.schema_.filter(f => f.id !== selectedField.id && f.type !== 'section').map(f => (
                                <DropdownMenuRadioItem key={f.id} value={f.key}>{f.label} ({f.key})</DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="flex gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex-1 text-left p-1.5 text-xs rounded border border-[var(--border)] bg-[var(--background)]">{condition.operator}</button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuRadioGroup value={condition.operator} onValueChange={(val) => {
                                const newConditions = [...(selectedField.conditions || [])]
                                newConditions[idx] = { ...condition, operator: val as any }
                                updateField(selectedField.id, { conditions: newConditions })
                              }}>
                                <DropdownMenuRadioItem value="equals">equals</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="not_equals">not equals</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="contains">contains</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="greater_than">greater than</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="less_than">less than</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="is_empty">is empty</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="is_not_empty">is not empty</DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                            <input
                              type="text"
                              value={String(condition.value || '')}
                              onChange={(e) => {
                                const newConditions = [...(selectedField.conditions || [])]
                                newConditions[idx] = { ...condition, value: e.target.value }
                                updateField(selectedField.id, { conditions: newConditions })
                              }}
                              placeholder="value"
                              className="flex-1 p-1.5 text-xs rounded border border-[var(--border)] bg-[var(--background)]"
                            />
                          )}
                        </div>
                        {(selectedField.conditions?.length || 0) > 1 && (
                          <button
                            onClick={() => {
                              const newConditions = selectedField.conditions?.filter((_, i) => i !== idx)
                              updateField(selectedField.id, { conditions: newConditions })
                            }}
                            className="text-xs text-[var(--destructive)] hover:underline"
                          >
                            Remove condition
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newConditions = [
                          ...(selectedField.conditions || []),
                          { fieldKey: '', operator: 'equals' as const, value: '', action: 'show' as const }
                        ]
                        updateField(selectedField.id, { conditions: newConditions })
                      }}
                      className="flex items-center gap-1 text-xs text-[var(--primary)] hover:opacity-80 font-medium"
                    >
                      <Plus size={12} /> Add Condition
                    </button>
                  </div>
                </div>
              )}

              {/* Section Field Properties */}
              {selectedField.type === 'section' && (
                <div className="pt-4 border-t border-[var(--border)] space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="collapsed"
                      checked={selectedField.collapsed || false}
                      onChange={(e) => updateField(selectedField.id, { collapsed: e.target.checked })}
                      className="rounded border-[var(--border)]"
                    />
                    <label htmlFor="collapsed" className="text-sm text-[var(--foreground)]">Start collapsed</label>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Sections group related fields visually. Fields below this section (until the next section) will be grouped together.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}