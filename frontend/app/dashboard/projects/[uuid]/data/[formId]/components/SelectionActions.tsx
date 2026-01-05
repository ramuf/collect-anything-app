'use client'

import React from 'react'
import { Edit3, Trash2 } from 'lucide-react'

interface SelectionActionsProps {
  selectedCount: number
  onEdit: () => void
  onDelete: () => void
}

export default function SelectionActions({ selectedCount, onEdit, onDelete }: SelectionActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--secondary)]/50 px-4 py-2">
      <div className="text-sm text-[var(--foreground)] whitespace-nowrap">
        {selectedCount} submission{selectedCount > 1 ? 's' : ''} selected
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          disabled={selectedCount !== 1}
          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--background)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={selectedCount !== 1 ? 'Select exactly one submission to edit' : 'Edit submission'}
        >
          <Edit3 size={16} />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-600/10 transition-colors"
          title="Delete selected submissions"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  )
}