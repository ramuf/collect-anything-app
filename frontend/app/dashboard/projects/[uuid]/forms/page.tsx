import React from 'react'
import FormsList from '../components/FormsList'

export default async function ProjectPage({ params }: { params: any }) {
    const { uuid } = await params;
    return (
        <main className="w-full px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Project Overview</h1>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Manage your collections and submissions for project <span className="font-mono text-xs bg-[var(--secondary)] px-1.5 py-0.5 rounded text-[var(--foreground)]">{uuid}</span>
                </p>
            </div>

            <div className="mt-6">
                <FormsList projectId={uuid} />
            </div>
        </main>
    )
}
