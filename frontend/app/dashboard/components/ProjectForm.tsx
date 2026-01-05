"use client"

import React, { useState, useEffect } from "react";

type Project = {
  id?: string;
  name?: string;
  description?: string;
};

export default function ProjectForm({
  initial,
  onCancel,
  onSave,
  showHeader = true,
}: {
  initial?: Project;
  onCancel: () => void;
  onSave: (p: Project) => Promise<void> | void;
  showHeader?: boolean;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(initial?.name || "");
    setDescription(initial?.description || "");
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ id: initial?.id, name, description });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--card-foreground)]">
      {showHeader && (
        <h3 className="text-base font-semibold mb-2">{initial ? "Edit Project" : "New Project"}</h3>
      )}

      <div className="grid gap-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            placeholder="Project name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--muted-foreground)]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[88px] rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            placeholder="Short description (optional)"
          />
        </div>

        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || !name}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white shadow-sm disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted-foreground)]/6"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
