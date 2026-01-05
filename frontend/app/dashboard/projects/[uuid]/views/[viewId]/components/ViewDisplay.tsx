'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Download, 
  Loader2, 
  Search, 
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Database,
  RefreshCw,
  Edit,
  Table as TableIcon
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'

interface ViewColumn {
  id: string
  formId: string
  fieldKey: string
  label: string
}

interface View {
  id: string
  title: string
  description?: string
  config: {
    columns?: ViewColumn[]
  }
  created_at: string
}

interface ViewData {
  id: string
  created_at: string
  form_id: string
  [key: string]: any
}

type SortDirection = 'asc' | 'desc' | null

interface SortConfig {
  key: string
  direction: SortDirection
}

interface ViewDisplayProps {
  projectId: string
  viewId: string
}

export default function ViewDisplay({ projectId, viewId }: ViewDisplayProps) {
  const [view, setView] = useState<View | null>(null)
  const [viewData, setViewData] = useState<ViewData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' })
  const { toast } = useToast()

  const fetchData = async (showRefreshLoader = false) => {
    if (showRefreshLoader) setRefreshing(true)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      
      const [viewRes, dataRes] = await Promise.all([
        fetch(`${apiUrl}/views/${viewId}`, { 
          credentials: 'include',
          cache: 'no-store'
        }),
        fetch(`${apiUrl}/views/${viewId}/data`, { 
          credentials: 'include',
          cache: 'no-store'
        })
      ])
      
      if (viewRes.ok) {
        const viewData = await viewRes.json()
        setView(viewData)
      }
      
      if (dataRes.ok) {
        const data = await dataRes.json()
        setViewData(data)
      }
    } catch (error) {
      console.error('Failed to fetch view data', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [viewId])

  const columns = view?.config?.columns || []

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key !== key) {
        return { key, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' }
      }
      if (prev.direction === 'desc') {
        return { key: 'created_at', direction: 'desc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown size={14} className="text-[var(--muted-foreground)]" />
    }
    if (sortConfig.direction === 'asc') {
      return <ChevronUp size={14} className="text-[var(--primary)]" />
    }
    return <ChevronDown size={14} className="text-[var(--primary)]" />
  }

  const filteredAndSortedData = useMemo(() => {
    let result = [...viewData]
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(row => {
        // Search in all column values
        return columns.some(col => {
          const val = row[col.id]
          if (val === null || val === undefined) return false
          return String(val).toLowerCase().includes(query)
        })
      })
    }
    
    // Sort
    if (sortConfig.direction) {
      result.sort((a, b) => {
        let aVal: any
        let bVal: any
        
        if (sortConfig.key === 'created_at') {
          aVal = new Date(a.created_at).getTime()
          bVal = new Date(b.created_at).getTime()
        } else {
          aVal = a[sortConfig.key]
          bVal = b[sortConfig.key]
        }
        
        // Handle null/undefined
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return 1
        if (bVal == null) return -1
        
        // Compare
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal)
        }
        
        if (sortConfig.direction === 'asc') {
          return aVal > bVal ? 1 : -1
        }
        return aVal < bVal ? 1 : -1
      })
    }
    
    return result
  }, [viewData, searchQuery, sortConfig, columns])

  const handleExportCSV = () => {
    if (!view || filteredAndSortedData.length === 0) {
      toast({ title: 'No data to export', variant: 'info' })
      return
    }
    
    const headers = ['Created At', ...columns.map(c => c.label)]
    
    const rows = filteredAndSortedData.map(row => {
      const values = columns.map(col => {
        const val = row[col.id]
        if (val === undefined || val === null) return ''
        if (Array.isArray(val)) return val.join('; ')
        return String(val)
      })
      return [new Date(row.created_at).toLocaleString(), ...values]
    })
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${view.title.toLowerCase().replace(/\s+/g, '-')}-view.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatCellValue = (value: any): string => {
    if (value === undefined || value === null) return '—'
    
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    
    return String(value)
  }

  if (loading) {
    return (
      <main className="w-full px-8 py-8">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      </main>
    )
  }

  if (!view) {
    return (
      <main className="w-full px-8 py-8">
        <div className="text-center text-[var(--muted-foreground)]">
          View not found
        </div>
      </main>
    )
  }

  return (
    <main className="w-full px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/projects/${projectId}/views`}
          className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Views
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                <TableIcon size={20} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">{view.title}</h1>
                {view.description && (
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{view.description}</p>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {viewData.length} {viewData.length === 1 ? 'row' : 'rows'} • {columns.length} {columns.length === 1 ? 'column' : 'columns'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/projects/${projectId}/views/${viewId}/edit`}
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
              title="Edit view"
            >
              <Edit size={16} />
              <span className="hidden sm:inline">Edit View</span>
            </Link>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filteredAndSortedData.length === 0}
              className="flex items-center gap-1 rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search data..."
            className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* Table */}
      {columns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)]">
            <TableIcon size={32} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">No columns configured</h3>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Edit this view to add columns from your forms.
          </p>
          <Link
            href={`/dashboard/projects/${projectId}/views/${viewId}/edit`}
            className="mt-6 flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--primary)]/25 transition-transform hover:scale-105"
          >
            <Edit size={16} />
            Edit View
          </Link>
        </div>
      ) : viewData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)]">
            <Database size={32} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">No data available</h3>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Submit some data to your forms to see it here.
          </p>
        </div>
      ) : (
        <div className="border border-[var(--border)] bg-[var(--card)] overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--secondary)] hover:bg-[var(--secondary)] border-b-2 border-[var(--border)]">
                  <TableHead 
                    className="cursor-pointer select-none whitespace-nowrap"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      Created At
                      {getSortIcon('created_at')}
                    </div>
                  </TableHead>
                  {columns.map((col) => (
                    <TableHead
                      key={col.id}
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSort(col.id)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {getSortIcon(col.id)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length + 1} 
                      className="h-24 text-center text-[var(--muted-foreground)]"
                    >
                      No results found for &quot;{searchQuery}&quot;
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((row) => (
                    <TableRow key={row.id} className="hover:bg-[var(--secondary)]/50 transition-colors">
                      <TableCell className="whitespace-nowrap text-[var(--muted-foreground)]">
                        {new Date(row.created_at).toLocaleString()}
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell key={col.id} className="max-w-xs truncate">
                          {formatCellValue(row[col.id])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Footer with count */}
          <div className="border-t border-[var(--border)] bg-[var(--secondary)]/30 px-4 py-3 text-sm text-[var(--muted-foreground)]">
            Showing {filteredAndSortedData.length} of {viewData.length} rows
          </div>
        </div>
      )}
    </main>
  )
}
