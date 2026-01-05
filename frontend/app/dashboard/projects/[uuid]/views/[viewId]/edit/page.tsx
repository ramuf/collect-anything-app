'use client'

import { useEffect, useState } from 'react'
import ViewBuilder from '../../components/ViewBuilder'

interface View {
  id: string
  title: string
  description?: string
  config: any
  created_at: string
}

export default function EditViewPage({ params }: { params: Promise<{ uuid: string, viewId: string }> }) {
  const [uuid, setUuid] = useState<string>('')
  const [viewId, setViewId] = useState<string>('')
  const [view, setView] = useState<View | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(p => {
      setUuid(p.uuid)
      setViewId(p.viewId)
    })
  }, [params])

  useEffect(() => {
    if (!viewId) return

    const fetchView = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      try {
        const res = await fetch(`${apiUrl}/views/${viewId}`, { 
          cache: 'no-store',
          credentials: 'include'
        })
        if (res.ok) {
          const data = await res.json()
          setView(data)
        } else {
          console.error('Failed to fetch view:', res.status, await res.text())
        }
      } catch (error) {
        console.error('Failed to fetch view', error)
      } finally {
        setLoading(false)
      }
    }

    fetchView()
  }, [viewId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-[var(--muted-foreground)]">
        Loading...
      </div>
    )
  }

  if (!view) {
    return (
      <div className="flex items-center justify-center h-screen text-[var(--muted-foreground)]">
        View not found
      </div>
    )
  }

  return <ViewBuilder projectId={uuid} initialView={view} />
}
