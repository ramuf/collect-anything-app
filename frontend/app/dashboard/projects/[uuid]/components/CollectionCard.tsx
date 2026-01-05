"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import CollectionCardHeader from './CollectionCardHeader'
import CollectionCardStats from './CollectionCardStats'
import CollectionCardActions from './CollectionCardActions'

interface CollectionCardProps {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  projectId: string;
  onDelete: () => void;
}

export default function CollectionCard({
  id,
  title,
  slug,
  createdAt,
  projectId,
  onDelete,
}: CollectionCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any | null>(null)
  const [loadingForm, setLoadingForm] = useState(false)

  // Deterministic accent based on title length
  const accents = [
    { ring: "ring-blue-500/20", icon: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    { ring: "ring-violet-500/20", icon: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
    { ring: "ring-emerald-500/20", icon: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    { ring: "ring-amber-500/20", icon: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  ];
  const accent = accents[title.length % accents.length];

  useEffect(() => {
    let mounted = true;
    const fetchCount = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/forms/${id}/submissions`, { credentials: 'include' });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setCount(Array.isArray(data) ? data.length : 0);
        } else {
          setCount(0);
        }
      } catch (err) {
        console.error('Failed to fetch submission count for form', id, err);
        if (mounted) setCount(0);
      }
    };

    fetchCount();
    return () => { mounted = false };
  }, [id]);

  const handleNewSubmission = () => {
    setCount((c) => (typeof c === 'number' ? c + 1 : c));
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden transition-shadow hover:shadow-lg focus-within:ring-2",
        accent.ring
      )}
    >
      <CollectionCardHeader id={id} title={title} slug={slug} projectId={projectId} onDelete={onDelete} />
      <CollectionCardStats count={count} createdAt={createdAt} />
      <CollectionCardActions id={id} projectId={projectId} onSubmitted={handleNewSubmission} />
    </div>
  )
}
