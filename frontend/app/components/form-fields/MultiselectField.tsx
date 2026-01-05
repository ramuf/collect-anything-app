"use client"

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { X, ChevronDown, Plus, Sparkles } from 'lucide-react'
import { Field, OptionItem } from './types'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import PublicFormRenderer from '../PublicFormRenderer'

interface MultiselectFieldProps {
  field: Field
  value: any
  onChange: (value: any) => void
  dynamicOptions?: Array<string | OptionItem>
}

export default function MultiselectField({ field, value, onChange, dynamicOptions }: MultiselectFieldProps) {
  const options = field.options || []
  const source: OptionItem[] = useMemo(
    () =>
      (dynamicOptions || options).map((o: any) =>
        typeof o === 'string' ? { value: o, label: o } : o
      ),
    [dynamicOptions, options]
  )

  const sourceKey = useMemo(() => {
    // Track content (not reference) to avoid infinite loops when arrays are recreated each render.
    return source.map((o) => `${o.value}\u0000${o.label}`).join('\u0001')
  }, [source])

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [localOptions, setLocalOptions] = useState<OptionItem[]>(source)

  const lastAppliedSourceKeyRef = useRef(sourceKey)
  
  // Sheet state for full form
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetForm, setSheetForm] = useState<any | null>(null)
  const [sheetLoading, setSheetLoading] = useState(false)
  const [prefillValue, setPrefillValue] = useState('')
  
  // Quick create state
  const [quickCreating, setQuickCreating] = useState(false)

  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const optionsListRef = useRef<HTMLDivElement | null>(null)

  const rawSelected: string[] = Array.isArray(value) ? value : []
  
  const isDynamicSource = field.dataSource?.type === 'form_lookup' && field.dataSource?.formId
  const lookupDisplayField = field.dataSource?.fieldKey || null

  const rawSelectedAny: any[] = Array.isArray(value) ? value : []

  useEffect(() => {
    if (lastAppliedSourceKeyRef.current === sourceKey) return
    setLocalOptions(source)
    lastAppliedSourceKeyRef.current = sourceKey
  }, [source, sourceKey])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return localOptions
    return localOptions.filter(o => o.label.toLowerCase().includes(q))
  }, [localOptions, query])

  // Check if query is a new value (not in options)
  const queryIsNew = useMemo(() => {
    const q = query.trim()
    if (!q) return false
    return !localOptions.some(o => o.label.toLowerCase() === q.toLowerCase())
  }, [query, localOptions])

  const labelByValue = useMemo(() => {
    const m = new Map<string, string>()
    for (const o of localOptions) m.set(o.value, o.label)
    return m
  }, [localOptions])

  const valueByLabel = useMemo(() => {
    const m = new Map<string, string>()
    for (const o of localOptions) m.set(o.label.toLowerCase(), o.value)
    return m
  }, [localOptions])

  const selectedValues: string[] = rawSelectedAny
    .map((v) => {
      if (typeof v === 'object' && v?.id) return String(v.id)
      if (typeof v !== 'string') return String(v)
      // If the stored value is a legacy label, resolve to the current option id.
      return valueByLabel.get(v.toLowerCase()) || v
    })
    .filter(Boolean)

  const toStoredValue = useCallback(
    (id: string) => {
      if (isDynamicSource) return { id, displayField: lookupDisplayField }
      return id
    },
    [isDynamicSource, lookupDisplayField]
  )

  const displayForValue = (v: string) => labelByValue.get(v) || v

  const toggle = (opt: string) => {
    if (selectedValues.includes(opt)) {
      onChange(selectedValues.filter(s => s !== opt).map(toStoredValue))
    } else {
      onChange([...selectedValues, opt].map(toStoredValue))
    }
  }

  // Quick create: just POST the single field value
  const quickCreate = useCallback(async (newValue: string) => {
    if (!isDynamicSource || !field.dataSource?.fieldKey) return false
    
    setQuickCreating(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const url = apiUrl 
        ? `${apiUrl}/forms/${field.dataSource.formId}/submissions`
        : `/api/forms/${field.dataSource.formId}/submissions`
      
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { [field.dataSource.fieldKey]: newValue } }),
      })
      
      if (resp.ok) {
        // Success - add to local options and select by submission id
        const sub = await resp.json()
        const id = String(sub?.id)
        const label = String(sub?.data?.[field.dataSource.fieldKey] ?? newValue)
        setLocalOptions(prev => [...prev, { value: id, label }])
        onChange([...selectedValues, id].map(toStoredValue))
        setQuery('')
        return true
      }
      
      // If validation error (400), need full form
      if (resp.status === 400) {
        return false
      }
      
      return false
    } catch (err) {
      console.error('Quick create failed', err)
      return false
    } finally {
      setQuickCreating(false)
    }
  }, [isDynamicSource, field.dataSource, selectedValues, onChange, toStoredValue])

  // Open sheet with full form, optionally pre-filling a value
  const openFullForm = useCallback(async (prefill?: string) => {
    if (!isDynamicSource) return
    
    setSheetLoading(true)
    setPrefillValue(prefill || '')
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const url = apiUrl 
        ? `${apiUrl}/forms/${field.dataSource!.formId}`
        : `/api/forms/${field.dataSource!.formId}`
      
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load form')
      
      const formData = await res.json()
      setSheetForm(formData)
      setSheetOpen(true)
      setOpen(false) // Close popover
    } catch (err) {
      console.error('Failed to load source form', err)
    } finally {
      setSheetLoading(false)
    }
  }, [isDynamicSource, field.dataSource])

  // Handle "Create X" click - try quick create first, fall back to full form
  const handleCreateNew = useCallback(async () => {
    const newValue = query.trim()
    if (!newValue) return
    
    // Try quick create first
    const success = await quickCreate(newValue)
    
    if (!success) {
      // Quick create failed (validation), open full form with prefill
      await openFullForm(newValue)
    }
  }, [query, quickCreate, openFullForm])

  // After form submission, refresh options
  const handleFormSubmitted = useCallback(async () => {
    try {
      if (!field.dataSource?.formId || !field.dataSource?.fieldKey) return
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const url = apiUrl 
        ? `${apiUrl}/forms/${field.dataSource.formId}/fields/${field.dataSource.fieldKey}/submission-options`
        : `/api/forms/${field.dataSource.formId}/fields/${field.dataSource.fieldKey}/submission-options`
      
      const res = await fetch(url)
      if (!res.ok) return
      
      const raw = await res.json()
      const values: OptionItem[] = (raw || []).map((o: any) => ({ value: String(o.id), label: String(o.label) }))
      
      // Find newly added values
      const oldSet = new Set(localOptions.map(o => o.value))
      const added = values.filter(v => !oldSet.has(v.value))
      
      setLocalOptions(values)
      
      // Auto-select new values
      if (added.length > 0) {
        onChange([...selectedValues, ...added.map(a => a.value)].map(toStoredValue))
      }
    } catch (err) {
      console.error('Failed to refresh options', err)
    } finally {
      setSheetOpen(false)
      setSheetForm(null)
      setPrefillValue('')
    }
  }, [field.dataSource, localOptions, selectedValues, onChange, toStoredValue])

  // Modify the form to pre-fill the lookup field
  const formWithPrefill = useMemo(() => {
    if (!sheetForm || !prefillValue || !field.dataSource?.fieldKey) return sheetForm
    
    // We'll pass initial data via a modified form object
    // The PublicFormRenderer should handle initialData if we add it
    return {
      ...sheetForm,
      _prefillData: { [field.dataSource.fieldKey]: prefillValue }
    }
  }, [sheetForm, prefillValue, field.dataSource?.fieldKey])

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            className="w-full text-left flex items-center justify-between gap-2 rounded border px-3 py-2 cursor-pointer hover:border-primary/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              {selectedValues.length === 0 ? (
                <span className="text-muted-foreground">Select options</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedValues.map(s => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                    >
                      <span className="truncate max-w-[10rem]">{displayForValue(s)}</span>
                      <X
                        onClick={(e) => { e.stopPropagation(); toggle(s); }}
                        className="h-3 w-3 cursor-pointer text-primary/60 hover:text-primary"
                        aria-label={`Remove ${s}`}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 ml-2 shrink-0">
              {selectedValues.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onChange([]); }}
                    className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted/50"
                    aria-label="Clear all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="h-4 w-px bg-border" />
                </>
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-0" align="start">
          {/* Search input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Input
                ref={searchInputRef}
                placeholder={isDynamicSource ? "Search or type to create..." : "Search..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 pr-9"
                autoFocus
              />
              {query.trim().length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setQuery('')
                    searchInputRef.current?.focus()
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div
            ref={optionsListRef}
            className="max-h-60 overflow-y-auto overscroll-contain"
            onWheel={(e) => {
              // Some layouts swallow wheel events inside portals; force scroll here.
              if (optionsListRef.current) {
                optionsListRef.current.scrollTop += e.deltaY
                e.stopPropagation()
              }
            }}
          >
            <div className="p-1">
              {/* "Create new" option - shown when typing something new */}
              {isDynamicSource && queryIsNew && (
                <button
                  type="button"
                  onClick={handleCreateNew}
                  disabled={quickCreating || sheetLoading}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md text-primary bg-primary/5 hover:bg-primary/10 transition-colors mb-1"
                >
                  {quickCreating || sheetLoading ? (
                    <span className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>Create "<strong>{query.trim()}</strong>"</span>
                </button>
              )}

              {/* Existing options */}
              {filtered.length === 0 && !queryIsNew && (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No options found
                </div>
              )}
              
              {filtered.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Checkbox 
                    checked={selectedValues.includes(opt.value)} 
                    onCheckedChange={() => toggle(opt.value)} 
                  />
                  <span className="text-sm flex-1">{opt.label}</span>
                  {selectedValues.includes(opt.value) && (
                    <span className="text-xs text-muted-foreground">Selected</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-2 border-t flex items-center justify-between gap-2">
            {isDynamicSource && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openFullForm()}
                disabled={sheetLoading}
                className="text-xs gap-1"
              >
                <Plus className="h-3 w-3" />
                Add with full form
              </Button>
            )}
            <div className="flex-1" />
            <Button size="sm" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Slide-out sheet for full form */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {sheetForm ? `Add to ${sheetForm.title}` : 'Loading...'}
            </SheetTitle>
          </SheetHeader>
          
          {sheetForm && (
            <div className="mt-6">
              <PublicFormRenderer 
                form={formWithPrefill} 
                onSubmitted={handleFormSubmitted}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  )
}
 