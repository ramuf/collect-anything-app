'use client'

import React from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { FormField, Submission, ReferenceCache } from './types'

interface SubmissionTableRowProps {
  submission: Submission
  fields: FormField[]
  referenceCache: ReferenceCache
  isSelected: boolean
  onSelect: (submissionId: string, checked: boolean) => void
}

export default function SubmissionTableRow({
  submission,
  fields,
  referenceCache,
  isSelected,
  onSelect
}: SubmissionTableRowProps) {
  const formatCellValue = (value: unknown, field: FormField): string => {
    if (value === undefined || value === null) return '—'

    const formatLinked = (linkedValue: unknown, targetFormId: string, fallbackDisplayField?: string) => {
      const refId =
        typeof linkedValue === 'object' && linkedValue !== null && 'id' in linkedValue
          ? String((linkedValue as { id?: unknown }).id)
          : linkedValue
      const displayField =
        typeof linkedValue === 'object' && linkedValue !== null && 'displayField' in linkedValue
          ? String((linkedValue as { displayField?: unknown }).displayField)
          : fallbackDisplayField

      if (typeof refId !== 'string' || !refId) return String(linkedValue)

      const cache = referenceCache[targetFormId]
      if (cache && cache[refId]) {
        const subData = cache[refId]
        if (displayField && subData[displayField] !== undefined) {
          const val = subData[displayField]
          return typeof val === 'string' ? val : String(val)
        }
        const firstString = Object.values(subData).find((v): v is string => typeof v === 'string' && Boolean(v))
        if (firstString) return firstString
      }

      return `ID: ${refId.slice(0, 8)}...`
    }

    if (field.type === 'reference' && field.targetFormId) {
      if (Array.isArray(value)) {
        return value.map(v => formatLinked(v, field.targetFormId!, field.displayFieldKey)).join(', ')
      }
      return formatLinked(value, field.targetFormId!, field.displayFieldKey)
    }

    if (field.dataSource?.type === 'form_lookup' && field.dataSource?.formId) {
      if (Array.isArray(value)) {
        return value.map(v => formatLinked(v, field.dataSource!.formId!, field.dataSource!.fieldKey)).join(', ')
      }
      return formatLinked(value, field.dataSource!.formId!, field.dataSource!.fieldKey)
    }

    if (field.type === 'checkbox' && Array.isArray(value)) {
      return value
        .map((v) => {
          if (typeof v === 'object' && v?.id) return `ID: ${String(v.id).slice(0, 8)}...`
          return String(v)
        })
        .join(', ')
    }

    if (field.type === 'toggle') {
      return value ? 'Yes' : 'No'
    }

    if (field.type === 'date' && value) {
      try {
        return new Date(value as any).toLocaleDateString()
      } catch {
        return String(value)
      }
    }

    if (field.type === 'file' && value) {
      return '📎 File attached'
    }

    return String(value)
  }

  return (
    <TableRow
      className={`hover:bg-[var(--secondary)]/50 transition-colors cursor-pointer ${
        isSelected ? 'bg-[var(--primary)]/5' : ''
      }`}
      onClick={() => onSelect(submission.id, !isSelected)}
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(submission.id, e.target.checked)}
          className="rounded border-[var(--border)]"
        />
      </TableCell>
      <TableCell className="whitespace-nowrap text-[var(--muted-foreground)]">
        {new Date(submission.created_at).toLocaleString()}
      </TableCell>
      {fields.map((field, index) => (
        <TableCell key={`${field.key}-${index}`} className="max-w-xs truncate">
          {formatCellValue(
            field.type === 'reference' || field.dataSource?.type === 'form_lookup'
              ? (submission.data[field.id] ?? submission.data[field.key])
              : submission.data[field.key],
            field
          )}
        </TableCell>
      ))}
    </TableRow>
  )
}