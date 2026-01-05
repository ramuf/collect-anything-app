'use client'

import { useState, useEffect } from 'react'
import { Form, Submission, ReferenceCache, FormField } from '../types'

export function useSubmissionsData(formId: string) {
  const [form, setForm] = useState<Form | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [referenceCache, setReferenceCache] = useState<ReferenceCache>({})

  // Fetch reference data for fields that link to other forms
  const fetchReferenceData = async (fields: FormField[]) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const referenceFields = fields.filter(f => f.type === 'reference' && f.targetFormId)
    const lookupFields = fields.filter(
      (f) => f.dataSource?.type === 'form_lookup' && !!f.dataSource?.formId
    )

    // Get unique target form IDs (reference + form_lookup)
    const targetFormIds = [
      ...new Set([
        ...referenceFields.map(f => f.targetFormId!),
        ...lookupFields.map(f => f.dataSource!.formId!),
      ])
    ]

    const newCache: ReferenceCache = {}

    await Promise.all(targetFormIds.map(async (targetFormId) => {
      try {
        const res = await fetch(`${apiUrl}/forms/${targetFormId}/submissions`, { credentials: 'include' })
        if (res.ok) {
          const targetSubmissions: Submission[] = await res.json()
          newCache[targetFormId] = {}

          targetSubmissions.forEach((sub) => {
            // Store the full submission data for flexible field lookup
            newCache[targetFormId][sub.id] = sub.data
          })
        }
      } catch (error) {
        console.error(`Failed to fetch reference data for form ${targetFormId}`, error)
      }
    }))

    setReferenceCache(prev => ({ ...prev, ...newCache }))
  }

  const fetchData = async (showRefreshLoader = false) => {
    if (showRefreshLoader) setRefreshing(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

      const [formRes, subsRes] = await Promise.all([
        fetch(`${apiUrl}/forms/${formId}`, { credentials: 'include' }),
        fetch(`${apiUrl}/forms/${formId}/submissions`, { credentials: 'include' })
      ])

      if (formRes.ok) {
        const formData = await formRes.json()
        setForm(formData)

        // Fetch reference data for reference fields
        if (formData.schema_) {
          await fetchReferenceData(formData.schema_)
        }
      }

      if (subsRes.ok) {
        const subsData = await subsRes.json()
        setSubmissions(subsData)
      }
    } catch (error) {
      console.error('Failed to fetch data', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const updateSubmission = (updatedSubmission: Submission) => {
    setSubmissions(prev => prev.map(s => s.id === updatedSubmission.id ? updatedSubmission : s))
  }

  const removeSubmissions = (submissionIds: string[]) => {
    setSubmissions(prev => prev.filter(s => !submissionIds.includes(s.id)))
  }

  useEffect(() => {
    fetchData()
  }, [formId])

  return {
    form,
    submissions,
    loading,
    refreshing,
    referenceCache,
    fetchData,
    updateSubmission,
    removeSubmissions
  }
}