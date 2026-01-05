'use client'

import { useState, useMemo } from 'react'
import { Submission, SortConfig } from '../types'

export function useSubmissionSorting(submissions: Submission[], searchQuery: string) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' })

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

  const filteredAndSortedSubmissions = useMemo(() => {
    let result = [...submissions]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(sub => {
        // Search in all data fields
        const dataMatch = Object.values(sub.data).some(val => {
          if (val === null || val === undefined) return false
          return String(val).toLowerCase().includes(query)
        })
        // Also search in ID
        const idMatch = sub.id.toLowerCase().includes(query)
        return dataMatch || idMatch
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
        } else if (sortConfig.key === 'id') {
          aVal = a.id
          bVal = b.id
        } else {
          aVal = a.data[sortConfig.key]
          bVal = b.data[sortConfig.key]
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
  }, [submissions, searchQuery, sortConfig])

  return {
    sortConfig,
    filteredAndSortedSubmissions,
    handleSort
  }
}