import React from 'react'
import DataOverview from './components/DataOverview'

export default async function DataPage({ params }: { params: any }) {
    const { uuid } = await params;
    return (
        <main className="w-full px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Collected Data</h1>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    View and export submissions from your forms
                </p>
            </div>

            <DataOverview projectId={uuid} />
        </main>
    )
}
