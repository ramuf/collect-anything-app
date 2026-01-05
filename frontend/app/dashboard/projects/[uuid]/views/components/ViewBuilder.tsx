'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ArrowLeft, Save, Trash2, ChevronRight, ChevronDown, 
  Settings, GripVertical, TableProperties 
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'

interface Field {
  id: string
  type: string
  label: string
  key: string
  targetFormId?: string
  dataSource?: {
    type: 'static' | 'form_lookup'
    formId?: string
    fieldKey?: string
  }
}

interface Form {
  id: string
  title: string
  schema_: Field[]
}

interface ViewColumn {
  id: string
  formId: string
  fieldKey: string
  label: string
}

interface ViewLike {
  id: string
  title?: string
  description?: string
  config?: {
    columns?: ViewColumn[]
    baseFormId?: string
  }
}

interface SubmissionLike {
  id: string
  form_id: string
  data: Record<string, unknown>
  created_at: string
}

interface ViewBuilderProps {
  projectId: string
  initialView?: ViewLike
}

export default function ViewBuilder({ projectId, initialView }: ViewBuilderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState(initialView?.title || '')
  const [description, setDescription] = useState(initialView?.description || '')
  const [columns, setColumns] = useState<ViewColumn[]>(initialView?.config?.columns || [])
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set())
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([])
  const [saving, setSaving] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)

  const fetchForms = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const res = await fetch(`${apiUrl}/projects/${projectId}/forms`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setForms(data)
      }
    } catch (error) {
      console.error('Failed to fetch forms', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const fetchPreviewData = useCallback(async () => {
    if (columns.length === 0 || forms.length === 0) {
      setPreviewData([])
      return
    }

    // In a real app, we might want a dedicated preview endpoint.
    // Here we will fetch submissions for all involved forms and merge them client-side
    // to simulate what the backend `get_view_data` does.

    const formIds = new Set(columns.map(c => c.formId))
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

    let allSubmissions: SubmissionLike[] = []

    // Build form map from forms state - ensure string comparison
    const formMap = new Map<string, Form>()
    for (const form of forms) {
      if (formIds.has(form.id)) {
        formMap.set(form.id, form)
      }
    }

    // Fetch submissions for each form
    for (const formId of formIds) {
      try {
        const res = await fetch(`${apiUrl}/forms/${formId}/submissions`, {
          credentials: 'include'
        })
        if (res.ok) {
          const submissions = (await res.json()) as SubmissionLike[]
          allSubmissions = [...allSubmissions, ...submissions]
        }
      } catch (error) {
        console.error(`Failed to fetch submissions for form ${formId}`, error)
      }
    }

    const submissionMap = new Map(allSubmissions.map(s => [s.id, s]))

    const isRelationField = (field: Field): boolean => {
      if (field.type === 'reference') return true
      return field.dataSource?.type === 'form_lookup'
    }

    const relationTargetFormId = (field: Field): string | undefined => {
      if (field.type === 'reference') return field.targetFormId
      if (field.dataSource?.type === 'form_lookup') return field.dataSource.formId
      return undefined
    }

    const extractReferenceIds = (raw: unknown): string[] => {
      if (raw == null) return []
      if (Array.isArray(raw)) {
        const out: string[] = []
        for (const v of raw) out.push(...extractReferenceIds(v))
        return Array.from(new Set(out))
      }
      if (typeof raw === 'object') {
        const id = (raw as { id?: unknown }).id
        return typeof id === 'string' && id.trim() ? [id.trim()] : []
      }
      if (typeof raw === 'string') return raw.trim() ? [raw.trim()] : []
      return [String(raw)].filter(Boolean)
    }

    const baseFormId = initialView?.config?.baseFormId || columns[0]?.formId
    if (!baseFormId) {
      setPreviewData([])
      return
    }

    // Map: parent_submission_id -> child_form_id -> child submissions[]
    const parentToChildrenMap = new Map<string, Map<string, SubmissionLike[]>>()
    const seenEdges = new Set<string>()

    for (const childSub of allSubmissions) {
      if (childSub.form_id === baseFormId) continue

      const childForm = formMap.get(childSub.form_id)
      if (!childForm?.schema_) continue

      for (const field of childForm.schema_) {
        if (!isRelationField(field)) continue
        const target = relationTargetFormId(field)
        if (target !== baseFormId) continue

        const raw = (childSub.data as Record<string, unknown>)[field.id] ?? (childSub.data as Record<string, unknown>)[field.key]
        for (const parentId of extractReferenceIds(raw)) {
          const parentSub = submissionMap.get(parentId)
          if (!parentSub || parentSub.form_id !== baseFormId) continue

          const edgeKey = `${parentId}:${childSub.id}`
          if (seenEdges.has(edgeKey)) continue
          seenEdges.add(edgeKey)

          if (!parentToChildrenMap.has(parentId)) parentToChildrenMap.set(parentId, new Map())
          const childMap = parentToChildrenMap.get(parentId)!
          if (!childMap.has(childSub.form_id)) childMap.set(childSub.form_id, [])
          childMap.get(childSub.form_id)!.push(childSub)
        }
      }
    }

    const getColumnValue = (sub: SubmissionLike, formId: string, fieldKey: string): unknown => {
      const form = formMap.get(formId)
      const dataRecord = (sub.data || {}) as Record<string, unknown>

      const field = form?.schema_?.find((f) => f.key === fieldKey)
      if (field?.type === 'reference' || field?.dataSource?.type === 'form_lookup') {
        return dataRecord[field.id] ?? dataRecord[fieldKey]
      }
      return dataRecord[fieldKey]
    }

    const childFormIdsInColumns = Array.from(new Set(columns.map(c => c.formId))).filter(fid => fid !== baseFormId)

    const maxPreviewRows = 50
    const rows: Record<string, unknown>[] = []

    const baseSubs = allSubmissions.filter(s => s.form_id === baseFormId)

    for (const baseSub of baseSubs) {
      if (rows.length >= maxPreviewRows) break

      // Build combinations across child forms (cartesian product)
      let combos: Record<string, SubmissionLike | null>[] = [Object.fromEntries(childFormIdsInColumns.map(fid => [fid, null]))]

      for (const childFormId of childFormIdsInColumns) {
        const children = parentToChildrenMap.get(baseSub.id)?.get(childFormId) ?? []
        if (children.length === 0) continue

        const next: Record<string, SubmissionLike | null>[] = []
        for (const combo of combos) {
          for (const childSub of children) {
            next.push({ ...combo, [childFormId]: childSub })
            if (next.length + rows.length >= maxPreviewRows) break
          }
          if (next.length + rows.length >= maxPreviewRows) break
        }
        combos = next.length ? next : combos
        if (rows.length + combos.length >= maxPreviewRows) break
      }

      for (const pickedChildren of combos) {
        if (rows.length >= maxPreviewRows) break

        const row: Record<string, unknown> = {
          id: `${baseSub.id}:${Object.entries(pickedChildren).map(([fid, s]) => `${fid}=${s?.id ?? '-'}`).join('|')}`,
          created_at: baseSub.created_at,
          form_id: baseSub.form_id,
        }

        for (const col of columns) {
          let val: unknown = null
          if (col.formId === baseFormId) {
            val = getColumnValue(baseSub, baseSub.form_id, col.fieldKey)
          } else {
            const childSub = pickedChildren[col.formId]
            if (childSub) {
              val = getColumnValue(childSub, childSub.form_id, col.fieldKey)
            }
          }
          row[col.id] = val
        }

        rows.push(row)
      }
    }

    setPreviewData(rows)
  }, [columns, forms, initialView])

  useEffect(() => {
    void fetchForms()
  }, [fetchForms])

  useEffect(() => {
    void fetchPreviewData()
  }, [fetchPreviewData])

  const toggleFormExpand = (formId: string) => {
    const newExpanded = new Set(expandedForms)
    if (newExpanded.has(formId)) {
      newExpanded.delete(formId)
    } else {
      newExpanded.add(formId)
    }
    setExpandedForms(newExpanded)
  }

  const toggleField = (form: Form, field: Field) => {
    const existingColIndex = columns.findIndex(c => c.formId === form.id && c.fieldKey === field.key)
    
    if (existingColIndex >= 0) {
      // Remove
      const newCols = [...columns]
      newCols.splice(existingColIndex, 1)
      setColumns(newCols)
      if (selectedColumnId === columns[existingColIndex].id) {
        setSelectedColumnId(null)
      }
    } else {
      // Add
      const newCol: ViewColumn = {
        id: crypto.randomUUID(),
        formId: form.id,
        fieldKey: field.key,
        label: `${form.title} - ${field.label}`
      }
      setColumns([...columns, newCol])
      setSelectedColumnId(newCol.id)
    }
  }

  const updateColumn = (id: string, updates: Partial<ViewColumn>) => {
    const newCols = columns.map(c => c.id === id ? { ...c, ...updates } : c)
    setColumns(newCols)
  }

  const deleteColumn = (id: string) => {
    const newCols = columns.filter(c => c.id !== id)
    setColumns(newCols)
    if (selectedColumnId === id) setSelectedColumnId(null)
  }

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newCols = [...columns]
    if (direction === 'up' && index > 0) {
      [newCols[index], newCols[index - 1]] = [newCols[index - 1], newCols[index]]
    } else if (direction === 'down' && index < newCols.length - 1) {
      [newCols[index], newCols[index + 1]] = [newCols[index + 1], newCols[index]]
    }
    setColumns(newCols)
  }

  const handleSave = async () => {
    if (!title) {
      toast({ title: 'Please enter a view title', variant: 'destructive' })
      return
    }

    setSaving(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    
    const viewData = {
      project_id: projectId,
      title,
      description,
      config: {
        columns,
        baseFormId: (initialView?.config?.baseFormId && columns.some(c => c.formId === initialView.config!.baseFormId))
          ? initialView.config!.baseFormId
          : columns[0]?.formId
      }
    }

    try {
      const url = initialView 
        ? `${apiUrl}/views/${initialView.id}`
        : `${apiUrl}/views/`
      
      const method = initialView ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(viewData),
        credentials: 'include'
      })

      if (res.ok) {
        const savedView = await res.json()
        router.push(`/dashboard/projects/${projectId}/views/${savedView.id}`)
        router.refresh()
      } else {
        toast({ title: 'Failed to save view', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Failed to save view', error)
      toast({ title: 'Failed to save view', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-full text-[var(--muted-foreground)]">Loading...</div>

  const selectedColumn = columns.find(c => c.id === selectedColumnId)
  const selectedColumnForm = selectedColumn ? forms.find(f => f.id === selectedColumn.formId) : null

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/projects/${projectId}`} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-[var(--foreground)]">
              {title || (initialView ? 'Edit View' : 'New View')}
            </h1>
            <p className="text-xs text-[var(--muted-foreground)]">
              {columns.length} column{columns.length !== 1 ? 's' : ''} configured
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save View'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar: Available Fields */}
        <div className="w-64 border-r border-[var(--border)] bg-[var(--card)] flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-4">
              <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Available Fields</h3>
              <div className="space-y-2">
                {forms.map(form => (
                  <div key={form.id} className="border rounded-md border-[var(--border)]">
                    <button 
                      onClick={() => toggleFormExpand(form.id)}
                      className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-[var(--muted)] transition-colors"
                    >
                      <span className="text-[var(--foreground)]">{form.title}</span>
                      {expandedForms.has(form.id) ? <ChevronDown size={16} className="text-[var(--muted-foreground)]" /> : <ChevronRight size={16} className="text-[var(--muted-foreground)]" />}
                    </button>
                    
                    {expandedForms.has(form.id) && (
                      <div className="p-2 bg-[var(--muted)]/50 border-t border-[var(--border)] space-y-1">
                        {form.schema_ && form.schema_.length > 0 ? (
                          form.schema_.map(field => {
                            const isSelected = columns.some(c => c.formId === form.id && c.fieldKey === field.key)
                            return (
                              <div key={field.id} className="flex items-center space-x-2 p-1.5 hover:bg-[var(--muted)] rounded">
                                <Checkbox 
                                  id={`${form.id}-${field.id}`} 
                                  checked={isSelected}
                                  onCheckedChange={() => toggleField(form, field)}
                                />
                                <label 
                                  htmlFor={`${form.id}-${field.id}`}
                                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full text-[var(--foreground)]"
                                >
                                  {field.label}
                                </label>
                              </div>
                            )
                          })
                        ) : (
                          <p className="text-xs text-[var(--muted-foreground)] p-2">No fields in this form</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Center: Canvas / Preview */}
        <div className="flex-1 bg-[var(--background)] overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] min-h-[500px] p-8">
            <div className="mb-8 border-b border-[var(--border)] pb-6">
              <h2 className="text-3xl font-bold text-[var(--foreground)]">{title || 'Untitled View'}</h2>
              {description && <p className="mt-2 text-[var(--muted-foreground)]">{description}</p>}
            </div>

            {columns.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-lg">
                <TableProperties className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4 opacity-50" />
                <p className="text-[var(--muted-foreground)]">Your view is empty.</p>
                <p className="text-sm text-[var(--muted-foreground)] opacity-70 mt-1">Select fields from the sidebar to add columns.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Column List / Reorderable */}
                <div className="space-y-2 mb-6">
                  {columns.map((col, index) => (
                    <div
                      key={col.id}
                      onClick={() => setSelectedColumnId(col.id)}
                      className={`relative group p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedColumnId === col.id
                          ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                          : 'border-transparent hover:border-[var(--border)] bg-[var(--muted)]/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical size={16} className="text-[var(--muted-foreground)] opacity-50" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--foreground)]">{col.label}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {forms.find(f => f.id === col.formId)?.title} → {col.fieldKey}
                          </p>
                        </div>
                        <div className={`flex gap-1 ${selectedColumnId === col.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                          <button
                            onClick={(e) => { e.stopPropagation(); moveColumn(index, 'up') }}
                            disabled={index === 0}
                            className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30"
                          >
                            <ArrowLeft size={14} className="rotate-90" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); moveColumn(index, 'down') }}
                            disabled={index === columns.length - 1}
                            className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30"
                          >
                            <ArrowLeft size={14} className="-rotate-90" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteColumn(col.id) }}
                            className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Preview Table */}
                <div className="border-t border-[var(--border)] pt-6">
                  <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Data Preview</h3>
                  <div className="rounded-md border border-[var(--border)] overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {columns.map(col => (
                            <TableHead key={col.id} className="text-[var(--foreground)]">{col.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center text-[var(--muted-foreground)]">
                              No data found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          previewData.map((row, i) => (
                            <TableRow key={i}>
                              {columns.map(col => (
                                <TableCell key={col.id} className="text-[var(--foreground)]">
                                  {row[col.id] !== undefined && row[col.id] !== null ? String(row[col.id]) : '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Properties */}
        <div className="w-80 border-l border-[var(--border)] bg-[var(--card)] flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-6">
              {/* View Settings - Always visible */}
              <div className="space-y-6 mb-8">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">View Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">View Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. All Submissions"
                      className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] outline-none text-[var(--foreground)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe this view..."
                      className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] outline-none text-[var(--foreground)]"
                    />
                  </div>
                </div>
              </div>

              {/* Column Properties - When selected */}
              {selectedColumn ? (
                <div className="space-y-6 border-t border-[var(--border)] pt-6 animate-in slide-in-from-right-4 duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">Column Properties</h3>
                    <button onClick={() => deleteColumn(selectedColumn.id)} className="text-[var(--destructive)] hover:opacity-80 text-xs">Delete</button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Column Label</label>
                      <input
                        type="text"
                        value={selectedColumn.label}
                        onChange={(e) => updateColumn(selectedColumn.id, { label: e.target.value })}
                        className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] outline-none text-[var(--foreground)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Source Form</label>
                      <input
                        type="text"
                        value={selectedColumnForm?.title || 'Unknown Form'}
                        disabled
                        className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Field Key</label>
                      <input
                        type="text"
                        value={selectedColumn.fieldKey}
                        disabled
                        className="w-full p-2 text-sm rounded-md border border-[var(--border)] bg-[var(--muted)] font-mono text-xs text-[var(--muted-foreground)]"
                      />
                    </div>
                  </div>
                </div>
              ) : columns.length > 0 ? (
                <div className="flex flex-col items-center justify-center text-[var(--muted-foreground)] text-center p-4 border-t border-[var(--border)] pt-6">
                  <Settings className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-sm">Select a column to edit its properties</p>
                </div>
              ) : null}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
