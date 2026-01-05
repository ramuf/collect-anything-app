'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Type, AlignLeft, Hash, Calendar, Clock, List, CheckSquare,
  ToggleLeft, Upload, Eye, Save, ArrowLeft, Trash2, GripVertical,
  Settings, Plus, Import, Link2, Calculator, GitBranch, ListChecks, LayoutList,
  ChevronDown, Search, X, DollarSign, Star, SlidersHorizontal
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

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

const FIELD_GROUPS = [
  { id: 'basic', label: 'Basic', types: ['text', 'textarea', 'number', 'currency', 'date', 'time', 'rating', 'slider'] },
  { id: 'choices', label: 'Choices', types: ['select', 'multiselect', 'radio', 'checkbox', 'toggle'] },
  { id: 'advanced', label: 'Advanced', types: ['file', 'reference', 'calculated', 'conditional', 'section'] },
]

interface FormEditorToolboxProps {
  form: Form | null
  projectForms: Form[]
  addField: (type: string) => void
  setShowImporter: (show: boolean) => void
}

export default function FormEditorToolbox({ form, projectForms, addField, setShowImporter }: FormEditorToolboxProps) {
  const [search, setSearch] = useState('')

  const matchesSearch = (label: string, type: string) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return label.toLowerCase().includes(q) || type.toLowerCase().includes(q)
  }

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    FIELD_GROUPS.forEach((g, i) => { init[g.id] = i === 0 })
    return init
  })

  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const inputRef = useRef<HTMLInputElement | null>(null)
  const prevExpandedRef = useRef<Record<string, boolean> | null>(null)

  useEffect(() => {
    // initialize maxHeight for expanded groups to none so they size naturally
    FIELD_GROUPS.forEach((g) => {
      const el = contentRefs.current[g.id]
      if (!el) return
      if (expanded[g.id]) {
        el.style.maxHeight = 'none'
      } else {
        el.style.maxHeight = '0px'
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = (id: string) => {
    const el = contentRefs.current[id]
    const willExpand = !expanded[id]
    if (!el) {
      // If we don't have the element ref yet, still update state
      // When opening, ensure only this group is marked expanded
      if (willExpand) {
        // when a search is active, allow multiple groups to be expanded
        if (search.trim()) {
          setExpanded(prev => ({ ...prev, [id]: true }))
        } else {
          setExpanded(() => FIELD_GROUPS.reduce((acc: Record<string, boolean>, g) => ({ ...acc, [g.id]: g.id === id }), {}))
        }
      } else {
        setExpanded(prev => ({ ...prev, [id]: false }))
      }
      return
    }
    if (willExpand) {
      // If search is active, allow multiple groups to expand; otherwise collapse others first
      if (!search.trim()) {
        Object.keys(expanded).forEach((key) => {
          if (key === id) return
          if (!expanded[key]) return
          const other = contentRefs.current[key]
          if (!other) return
          // animate collapse (opacity handled by inner class)
          other.style.maxHeight = `${other.scrollHeight}px`
          void other.offsetHeight
          other.style.transition = 'max-height 420ms cubic-bezier(.2,.8,.2,1)'
          other.style.maxHeight = '0px'
        })
      }

      // expand target
      el.style.display = ''
      el.style.maxHeight = '0px'
      void el.offsetHeight
      el.style.transition = 'max-height 520ms cubic-bezier(.2,.8,.2,1)'
      el.style.maxHeight = `${el.scrollHeight}px`
      // update expanded state: if search active, merge; else set single
      if (search.trim()) {
        setExpanded(prev => ({ ...prev, [id]: true }))
      } else {
        setExpanded(() => FIELD_GROUPS.reduce((acc: Record<string, boolean>, g) => ({ ...acc, [g.id]: g.id === id }), {}))
      }
      // remove explicit maxHeight after animation so it can grow naturally
      setTimeout(() => {
        const cur = contentRefs.current[id]
        if (cur) cur.style.maxHeight = 'none'
      }, 540)
    } else {
      // collapse target (opacity handled by inner class)
      el.style.maxHeight = `${el.scrollHeight}px`
      void el.offsetHeight
      el.style.transition = 'max-height 420ms cubic-bezier(.2,.8,.2,1)'
      el.style.maxHeight = '0px'
      setExpanded(prev => ({ ...prev, [id]: false }))
    }
  }

  // When searching, auto-expand groups containing matches and remember previous state
  useEffect(() => {
    const q = search.trim()
    if (q) {
      // save current expanded for restore
      if (!prevExpandedRef.current) prevExpandedRef.current = { ...expanded }
      const newExpanded: Record<string, boolean> = {}
      FIELD_GROUPS.forEach((g) => {
        const items = FIELD_TYPES.filter(ft => g.types.includes(ft.type) && matchesSearch(ft.label, ft.type))
        newExpanded[g.id] = items.length > 0
      })
      setExpanded(prev => ({ ...prev, ...newExpanded }))
    } else {
      // restore previous single-expanded state if we saved one
      if (prevExpandedRef.current) {
        setExpanded(prevExpandedRef.current)
        prevExpandedRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <div className="w-64 border-r border-[var(--border)] bg-[var(--card)] flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Sticky search */}
          <div className="sticky top-0 z-10 mb-4 bg-[var(--card)] pt-2">
            <label className="sr-only">Search elements</label>
            <div className="relative">
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search elements"
                aria-label="Search elements"
                className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg,rgba(0,0,0,0))] px-3 py-2 pl-9 pr-9 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)]"
              />
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--muted-foreground)]">
                <Search size={16} />
              </div>
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); inputRef.current?.focus(); }}
                  className="absolute inset-y-0 right-2 flex items-center justify-center rounded-md p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)]/10"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Form Elements</h3>

          {/* Collapsible groups */}
          <div className="space-y-4">
            {FIELD_GROUPS.map((group) => {
              const items = FIELD_TYPES.filter(ft => group.types.includes(ft.type) && matchesSearch(ft.label, ft.type))
              const isExpanded = !!expanded[group.id]
              return (
                <div key={group.id} className="px-1">
                    <button
                      onClick={() => toggle(group.id)}
                      className="w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] bg-[var(--muted)]/6 hover:bg-[var(--muted)]/10"
                    >
                      <span>{group.label}</span>
                      <ChevronDown className={`transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${isExpanded ? 'rotate-180' : 'rotate-0'}`} size={16} />
                    </button>

                  <div
                    ref={(el) => { contentRefs.current[group.id] = el }}
                    className="mt-2 grid grid-cols-1 gap-2 overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
                    style={{ maxHeight: isExpanded ? `${Math.max(items.length * 48, 120)}px` : 0 }}
                    aria-hidden={!isExpanded}
                  >
                    <div className={`transition-opacity duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                      {items.map((item) => {
                        let isDisabled = false
                        let disabledReason = ''

                        if (item.type === 'calculated') {
                          isDisabled = !form?.schema_.some(f => f.type === 'number' || f.type === 'date')
                          disabledReason = 'Add number or date fields first'
                        } else if (item.type === 'conditional') {
                          isDisabled = !form?.schema_.some(f => f.type !== 'section' && f.type !== 'calculated')
                          disabledReason = 'Add other fields first'
                        } else if (item.type === 'reference') {
                          isDisabled = projectForms.length === 0
                          disabledReason = 'Create other forms in this project first'
                        }

                        return (
                          <button
                            key={item.type}
                            onClick={() => !isDisabled && addField(item.type)}
                            disabled={isDisabled}
                            title={isDisabled ? disabledReason : item.label}
                            className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-all text-left group ${
                              isDisabled
                                ? 'text-[var(--muted-foreground)] opacity-50 cursor-not-allowed bg-[var(--muted)]/30'
                                : 'text-[var(--foreground)] hover:bg-[var(--muted)] border border-transparent hover:border-[var(--border)]'
                            }`}
                          >
                            <item.icon size={16} className={`${
                              isDisabled
                                ? 'text-[var(--muted-foreground)]'
                                : 'text-[var(--muted-foreground)] group-hover:text-[var(--primary)]'
                            }`} />
                            <span className="text-[var(--muted-foreground)]">{item.label}</span>
                            {isDisabled && (
                              <span className="ml-auto text-xs opacity-70">⚠️</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Actions</h3>
          <button
            onClick={() => setShowImporter(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] border border-dashed border-[var(--border)] hover:border-[var(--primary)] rounded-md transition-all text-left group"
          >
            <Import size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)]" />
            Import from other form
          </button>
        </div>
      </ScrollArea>
    </div>
  )
}