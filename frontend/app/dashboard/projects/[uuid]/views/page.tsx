'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import ViewsGrid from './components/ViewsGrid'

export default function ViewsPage({ params }: { params: Promise<{ uuid: string }> }) {
  const [uuid, setUuid] = useState<string>('')

  useEffect(() => {
    params.then(p => setUuid(p.uuid))
  }, [params])

  if (!uuid) return null

  return (
    <main className="w-full px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Views</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Create custom views to analyze your data across collections.
          </p>
        </div>
        <Link href={`/dashboard/projects/${uuid}/views/new`}>
          <button className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--primary)]/25 transition-transform hover:scale-105">
            <Plus size={16} />
            Create View
          </button>
        </Link>
      </div>

      <div className="mt-6">
        <ViewsGrid projectId={uuid} />
      </div>
    </main>
  )
}
