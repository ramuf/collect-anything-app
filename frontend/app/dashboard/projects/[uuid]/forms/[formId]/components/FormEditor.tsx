'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Type, AlignLeft, Hash, Calendar, Clock, List, ListChecks, CheckSquare, ToggleLeft, Upload, Link2, Calculator, GitBranch, LayoutList, DollarSign, Star, SlidersHorizontal } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import FieldImporter from './FieldImporter'
import FormEditorHeader from './FormEditorHeader'
import FormEditorToolbox from './FormEditorToolbox'
import FormEditorCanvas from './FormEditorCanvas'
import FormEditorProperties from './FormEditorProperties'

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
  targetFormId?: string // For reference fields
  displayFieldKey?: string // Which field from target form to display
  dataSource?: {
    type: 'static' | 'form_lookup'
    formId?: string
    fieldKey?: string
  }
  // Calculated field properties
  formula?: string // e.g., "{price} * {quantity}"
  // Conditional field properties
  conditions?: {
    fieldKey: string // Field to watch
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
    value?: string | number | boolean
    action: 'show' | 'hide'
  }[]
  // Section field properties
  collapsed?: boolean
  sectionFields?: string[] // IDs of fields that belong to this section (for grouping)
}

interface Form {
  id: string
  title: string
  slug: string
  project_id: string
  schema_: Field[]
  settings: any
}

const FIELD_TYPES = [
  { type: 'text', label: 'Short Text', icon: Type },
  { type: 'textarea', label: 'Long Text', icon: AlignLeft },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'currency', label: 'Currency', icon: DollarSign },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'time', label: 'Time', icon: Clock },
  { type: 'rating', label: 'Rating', icon: Star },
  { type: 'slider', label: 'Slider', icon: SlidersHorizontal },
  { type: 'select', label: 'Dropdown', icon: List },
  { type: 'multiselect', label: 'Multi-Select', icon: ListChecks },
  { type: 'radio', label: 'Single Choice', icon: CheckSquare },
  { type: 'checkbox', label: 'Multiple Choice', icon: CheckSquare },
  
  { type: 'toggle', label: 'Switch', icon: ToggleLeft },
  { type: 'file', label: 'File Upload', icon: Upload },
  { type: 'reference', label: 'Reference', icon: Link2 },
  { type: 'calculated', label: 'Calculated', icon: Calculator },
  { type: 'conditional', label: 'Conditional', icon: GitBranch },
  { type: 'section', label: 'Section', icon: LayoutList },
]

export default function FormEditor({ projectId, formId }: { projectId: string, formId: string }) {
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showImporter, setShowImporter] = useState(false)
  const [projectForms, setProjectForms] = useState<Form[]>([])
  const [targetFormSchemas, setTargetFormSchemas] = useState<Record<string, Field[]>>({})
  const router = useRouter()
  const { toast } = useToast()

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
  }

  useEffect(() => {
    fetchForm()
    fetchProjectForms()
  }, [formId])

  const fetchProjectForms = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/projects/${projectId}/forms`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setProjectForms(data.filter((f: Form) => f.id !== formId))
      }
    } catch (error) {
      console.error('Failed to fetch project forms', error)
    }
  }

  const fetchTargetFormSchema = async (targetFormId: string) => {
    if (targetFormSchemas[targetFormId]) return // Already fetched
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/forms/${targetFormId}`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setTargetFormSchemas(prev => ({ ...prev, [targetFormId]: data.schema_ || [] }))
      }
    } catch (error) {
      console.error('Failed to fetch target form schema', error)
    }
  }

  const fetchForm = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/forms/${formId}`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        // Ensure schema_ is an array
        if (!data.schema_) data.schema_ = []
        setForm(data)
        
        // Pre-fetch schemas for any existing reference fields
        data.schema_.forEach((field: Field) => {
          if (field.type === 'reference' && field.targetFormId) {
            fetchTargetFormSchema(field.targetFormId)
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch form', error)
    } finally {
      setLoading(false)
    }
  }

  const saveForm = async () => {
    if (!form) return
    setSaving(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/forms/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      })
      if (res.ok) {
        // Show success toast
        toast({ title: 'Form saved successfully!', variant: 'success' })
      }
    } catch (error) {
      console.error('Failed to save form', error)
      toast({ title: 'Failed to save form', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const addField = (type: string) => {
    if (!form) return
    const label = type === 'section' ? 'New Section' : 'New Field'
    const newField: Field = {
      id: crypto.randomUUID(),
      type,
      label,
      key: slugify(label),
      required: type === 'section' || type === 'calculated' ? false : false,
      options: type === 'select' || type === 'radio' || type === 'checkbox' || type === 'multiselect' ? ['Option 1', 'Option 2'] : undefined,
      formula: type === 'calculated' ? '' : undefined,
      conditions: type === 'conditional' ? [{ fieldKey: '', operator: 'equals', value: '', action: 'show' }] : undefined,
      collapsed: type === 'section' ? false : undefined,
      // Defaults for specialized fields
      ...(type === 'currency' ? { options: ['USD', 'EUR', 'GBP'], defaultCurrency: 'USD', step: 0.01 } : {}),
      ...(type === 'rating' ? { max: 5 } : {}),
      ...(type === 'slider' ? { min: 0, max: 100, step: 1 } : {}),
    }
    setForm({ ...form, schema_: [...form.schema_, newField] })
    setSelectedFieldId(newField.id)
  }

  const updateField = (id: string, updates: Partial<Field>) => {
    if (!form) return
    const newSchema = form.schema_.map(f => f.id === id ? { ...f, ...updates } : f)
    setForm({ ...form, schema_: newSchema })
  }

  const deleteField = (id: string) => {
    if (!form) return
    const newSchema = form.schema_.filter(f => f.id !== id)
    setForm({ ...form, schema_: newSchema })
    if (selectedFieldId === id) setSelectedFieldId(null)
  }

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (!form) return
    const newSchema = [...form.schema_]
    if (direction === 'up' && index > 0) {
      [newSchema[index], newSchema[index - 1]] = [newSchema[index - 1], newSchema[index]]
    } else if (direction === 'down' && index < newSchema.length - 1) {
      [newSchema[index], newSchema[index + 1]] = [newSchema[index + 1], newSchema[index]]
    }
    setForm({ ...form, schema_: newSchema })
  }

  const handleImportField = (field: Field) => {
    if (!form) return
    setForm({ ...form, schema_: [...form.schema_, field] })
    setSelectedFieldId(field.id)
  }

  if (loading) return <div className="flex items-center justify-center h-full text-[var(--muted-foreground)]">Loading...</div>
  if (!form) return <div className="flex items-center justify-center h-full text-[var(--muted-foreground)]">Form not found</div>

  const selectedField = form.schema_.find(f => f.id === selectedFieldId)

  return (
    <div className="flex flex-col h-screen">
      <FormEditorHeader
        form={form}
        saving={saving}
        saveForm={saveForm}
        projectId={projectId}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar: Toolbox */}
        <FormEditorToolbox
          form={form}
          projectForms={projectForms}
          addField={addField}
          setShowImporter={setShowImporter}
        />

        {/* Center: Canvas */}
        <FormEditorCanvas
          form={form}
          selectedFieldId={selectedFieldId}
          setSelectedFieldId={setSelectedFieldId}
          moveField={moveField}
          deleteField={deleteField}
          projectForms={projectForms}
        />

        {/* Right Sidebar: Properties */}
        <FormEditorProperties
          selectedField={selectedField}
          updateField={updateField}
          deleteField={deleteField}
          form={form}
          projectForms={projectForms}
          targetFormSchemas={targetFormSchemas}
          fetchTargetFormSchema={fetchTargetFormSchema}
        />
      </div>
      {showImporter && (
        <FieldImporter
          projectId={projectId}
          currentFormId={formId}
          onImport={handleImportField}
          onClose={() => setShowImporter(false)}
        />
      )}
    </div>
  )
}

