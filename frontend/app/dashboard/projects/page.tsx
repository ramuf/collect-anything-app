"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectsList } from "../components";
import NewProjectDialog from "../components/NewProjectDialog";
import { Plus } from "lucide-react";
import { useConfirm } from '@/components/ui/confirm'

type Project = {
  id: string;
  title: string;
  description?: string;
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const base = (process.env.NEXT_PUBLIC_API_URL as string) || "http://127.0.0.1:8000";
  const confirm = useConfirm()

  useEffect(() => {
    let mounted = true;
    const devToken = typeof window !== 'undefined' ? localStorage.getItem('dev_access_token') : null;
    const headers: any = devToken ? { Authorization: `Bearer ${devToken}` } : undefined;

    fetch(`${base}/projects/`, { credentials: "include", headers })
      .then((res) => {
        if (!res.ok) throw new Error("unauthorized");
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setProjects(data || []);
      })
      .catch(() => {
        router.push("/auth/login");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false };
  }, [router]);

  async function reload() {
    setLoading(true);
    try {
      const devToken = typeof window !== 'undefined' ? localStorage.getItem('dev_access_token') : null;
      const headers: any = devToken ? { Authorization: `Bearer ${devToken}` } : undefined;
      const res = await fetch(`${base}/projects/`, { credentials: "include", headers });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setProjects(data || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(p: any) {
    try {
      const devToken = typeof window !== 'undefined' ? localStorage.getItem('dev_access_token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (devToken) headers.Authorization = `Bearer ${devToken}`;

      if (p.id) {
        // update
        await fetch(`${base}/projects/${p.id}`, { method: 'PUT', credentials: 'include', headers, body: JSON.stringify(p) });
      } else {
        await fetch(`${base}/projects/`, { method: 'POST', credentials: 'include', headers, body: JSON.stringify(p) });
      }
      setShowForm(false);
      setEditing(null);
      await reload();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({ title: 'Delete project', description: 'Delete this project?' })
    if (!ok) return;
    try {
      const devToken = typeof window !== 'undefined' ? localStorage.getItem('dev_access_token') : null;
      const headers: any = {};
      if (devToken) headers.Authorization = `Bearer ${devToken}`;
      await fetch(`${base}/projects/${id}`, { method: 'DELETE', credentials: 'include', headers });
      await reload();
    } catch (e) {
      console.error(e);
    }
  }

  function handleEdit(p: Project) {
    setEditing(p);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Projects</h1>
          <p className="text-[var(--muted-foreground)]">Manage your collections and forms.</p>
        </div>
        <NewProjectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing ? { id: editing.id, name: editing.title, description: editing.description } : undefined}
          onSuccess={() => { setEditing(null); reload(); }}
          trigger={<button
            onClick={() => { setEditing(null); setDialogOpen(true) }}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--primary)]/25 transition-transform hover:scale-105"
          >
            <Plus size={18} />
            New Project
          </button>}
        />
      </div>

      {/* Dialog-driven project create/edit replaces embedded form */}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : (
        <ProjectsList
          projects={projects.map((p) => ({ id: String(p.id), name: p.title, description: p.description }))}
          onEdit={(p) => handleEdit({ id: p.id, title: p.name, description: p.description })}
          onDelete={(id) => handleDelete(id)}
        />
      )}
    </div>
  );
}
