'use client'

import React, { useState, useEffect } from 'react'
import { X, Search, ArrowRight, Copy, Database } from 'lucide-react'

interface Field {
  id: string
  type: string
  label: string
  key: string
  required: boolean
  placeholder?: string
  options?: string[]
  helpText?: string
  targetFormId?: string // For reference fields
  displayFieldKey?: string // Which field from target form to display
  dataSource?: {
    type: 'static' | 'form_lookup'
    formId?: string
    fieldKey?: string
  }
}

interface Form {
  id: string
  title: string
  slug: string
  schema_: Field[]
}

interface FieldImporterProps {
  projectId: string
  currentFormId: string
  onImport: (field: Field) => void
  onClose: () => void
}

export default function FieldImporter({ projectId, currentFormId, onImport, onClose }: FieldImporterProps) {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [search, setSearch] = useState('')
  const [selectedField, setSelectedField] = useState<Field | null>(null)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/projects/${projectId}/forms`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        // Filter out current form
        setForms(data.filter((f: Form) => f.id !== currentFormId))
      }
    } catch (error) {
      console.error('Failed to fetch forms', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyField = () => {
    if (!selectedField) return
    const newField = {
      ...selectedField,
      id: crypto.randomUUID(),
      key: `${selectedField.key}_copy`,
      dataSource: undefined // Ensure no data source is carried over if copying definition
    }
    onImport(newField)
    onClose()
  }

  const handleUseAsDataSource = () => {
    if (!selectedField || !selectedForm) return
    const newField: Field = {
      id: crypto.randomUUID(),
      type: 'select', // Force to select
      label: selectedField.label,
      key: `${selectedField.key}_lookup`,
      required: false,
      placeholder: `Select ${selectedField.label}`,
      dataSource: {
        type: 'form_lookup',
        formId: selectedForm.id,
        fieldKey: selectedField.key
      }
    }
    onImport(newField)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Import Field from Another Form</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left: Form List */}
          <div className="w-1/3 border-r border-slate-100 dark:border-slate-800 overflow-y-auto p-2">
            <div className="mb-2 px-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search forms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-md bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-950 border focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            
            {loading ? (
              <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
            ) : forms.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">No other forms found.</div>
            ) : (
              <div className="space-y-1">
                {forms
                  .filter(f => f.title.toLowerCase().includes(search.toLowerCase()))
                  .map(form => (
                    <button
                      key={form.id}
                      onClick={() => { setSelectedForm(form); setSelectedField(null); }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedForm?.id === form.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {form.title}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Middle: Field List */}
          <div className="w-1/3 border-r border-slate-100 dark:border-slate-800 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-950/50">
            {!selectedForm ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <ArrowRight className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">Select a form</p>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
                  Fields in "{selectedForm.title}"
                </h3>
                
                {(!selectedForm.schema_ || selectedForm.schema_.length === 0) ? (
                  <p className="text-sm text-slate-500 italic">This form has no fields.</p>
                ) : (
                  <div className="grid gap-2">
                    {selectedForm.schema_.map((field) => (
                      <button
                        key={field.id}
                        onClick={() => setSelectedField(field)}
                        className={`flex items-center justify-between p-3 border rounded-lg transition-all text-left ${
                          selectedField?.id === field.id
                            ? 'bg-white dark:bg-slate-900 border-blue-500 ring-1 ring-blue-500'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{field.label}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{field.type}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Action Panel */}
          <div className="flex-1 p-6 bg-white dark:bg-slate-900 flex flex-col">
            {!selectedField ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <ArrowRight className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">Select a field to import</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{selectedField.label}</h3>
                  <p className="text-sm text-slate-500">Select how you want to import this field.</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCopyField}
                    className="w-full p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 group-hover:text-blue-600">
                        <Copy size={20} />
                      </div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">Copy Field Definition</span>
                    </div>
                    <p className="text-sm text-slate-500 pl-[52px]">
                      Create a new field with the same settings (label, type, options) as the original.
                    </p>
                  </button>

                  <button
                    onClick={handleUseAsDataSource}
                    className="w-full p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 group-hover:text-blue-600">
                        <Database size={20} />
                      </div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">Use Submitted Data</span>
                    </div>
                    <p className="text-sm text-slate-500 pl-[52px]">
                      Create a dropdown field that lists all unique values submitted for this field in the other form.
                    </p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
