'use client'

import { useEffect, useState } from 'react'
import ViewDisplay from './components/ViewDisplay'

export default function ViewPage({ params }: { params: Promise<{ uuid: string, viewId: string }> }) {
  const [uuid, setUuid] = useState<string>('')
  const [viewId, setViewId] = useState<string>('')

  useEffect(() => {
    params.then(p => {
      setUuid(p.uuid)
      setViewId(p.viewId)
    })
  }, [params])

  if (!uuid || !viewId) {
    return (
      <div className="flex items-center justify-center h-screen text-[var(--muted-foreground)]">
        Loading...
      </div>
    )
  }

  return <ViewDisplay projectId={uuid} viewId={viewId} />
}
