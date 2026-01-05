'use client'

import React from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FormField, SortConfig } from './types'

interface SubmissionsTableHeaderProps {
  fields: FormField[]
  sortConfig: SortConfig
  selectedCount: number
  totalCount: number
  onSort: (key: string) => void
  onSelectAll: (checked: boolean) => void
}

export default function SubmissionsTableHeader({
  fields,
  sortConfig,
  selectedCount,
  totalCount,
  onSort,
  onSelectAll
}: SubmissionsTableHeaderProps) {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown size={14} className="text-[var(--muted-foreground)]" />
    }
    if (sortConfig.direction === 'asc') {
      return <ChevronUp size={14} className="text-[var(--primary)]" />
    }
    return <ChevronDown size={14} className="text-[var(--primary)]" />
  }

  return (
    <TableHeader>
      <TableRow className="bg-[var(--secondary)] hover:bg-[var(--secondary)] border-b-2 border-[var(--border)]">
        <TableHead className="w-12">
          <input
            type="checkbox"
            checked={selectedCount === totalCount && totalCount > 0}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="rounded border-[var(--border)]"
          />
        </TableHead>
        <TableHead
          className="cursor-pointer select-none whitespace-nowrap"
          onClick={() => onSort('created_at')}
        >
          <div className="flex items-center gap-1">
            Submitted At
            {getSortIcon('created_at')}
          </div>
        </TableHead>
        {fields.map((field, index) => (
          <TableHead
            key={`${field.key}-${index}`}
            className="cursor-pointer select-none whitespace-nowrap"
            onClick={() => onSort(field.key)}
          >
            <div className="flex items-center gap-1">
              {field.label || field.key}
              {getSortIcon(field.key)}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  )
}