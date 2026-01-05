"use client";

import { useState, useEffect } from "react";
import { Plus, Table } from "lucide-react";
import { useConfirm } from '@/components/ui/confirm'
import Link from "next/link";
import ViewCard from "./ViewCard";

interface View {
    id: string;
    title: string;
    description?: string;
    created_at: string;
}

export default function ViewsGrid({ projectId }: { projectId: string }) {
    const [views, setViews] = useState<View[]>([]);
    const [loading, setLoading] = useState(true);
    const confirm = useConfirm()

    useEffect(() => {
        if (!projectId) return;
        fetchViews();
    }, [projectId]);

    const fetchViews = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        try {
            const res = await fetch(`${apiUrl}/views/project/${projectId}`, {
                cache: 'no-store',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setViews(data);
            }
        } catch (error) {
            console.error('Failed to fetch views', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteView = async (viewId: string) => {
        const ok = await confirm({ title: 'Delete view', description: 'Are you sure you want to delete this view?' })
        if (!ok) return
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const res = await fetch(`${apiUrl}/views/${viewId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                fetchViews();
            }
        } catch (error) {
            console.error('Failed to delete view', error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
            </div>
        );
    }

    if (views.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)]">
                    <Table size={32} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">No views yet</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Create your first view to start analyzing data.
                </p>
                <div className="mt-6">
                    <Link href={`/dashboard/projects/${projectId}/views/new`}>
                        <button className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--primary)]/25 transition-transform hover:scale-105">
                            <Plus size={16} />
                            Create View
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {views.map((view) => (
                <ViewCard
                    key={view.id}
                    id={view.id}
                    title={view.title}
                    description={view.description}
                    createdAt={view.created_at}
                    projectId={projectId}
                    onDelete={() => handleDeleteView(view.id)}
                />
            ))}
        </div>
    );
}
