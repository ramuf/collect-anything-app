'use client'

import { useState } from 'react'
import { Submission } from '../types'

export function useSubmissionSelection(filteredSubmissions: Submission[]) {
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set())

  const handleSelectSubmission = (submissionId: string, checked: boolean) => {
    setSelectedSubmissions(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(submissionId)
      } else {
        newSet.delete(submissionId)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubmissions(new Set(filteredSubmissions.map(s => s.id)))
    } else {
      setSelectedSubmissions(new Set())
    }
  }

  const clearSelection = () => {
    setSelectedSubmissions(new Set())
  }

  return {
    selectedSubmissions,
    handleSelectSubmission,
    handleSelectAll,
    clearSelection
  }
}