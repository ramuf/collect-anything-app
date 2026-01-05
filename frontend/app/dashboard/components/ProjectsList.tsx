"use client"

import React from "react";
import { useRouter } from "next/navigation";
import ProjectCard from "./ProjectCard";
import { PlusCircle } from "lucide-react";

type Project = {
  id: string;
  name: string;
  description?: string;
};

export default function ProjectsList({
  projects,
  onEdit,
  onDelete,
}: {
  projects: Project[];
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();

  if (!projects.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)]">
          <PlusCircle size={32} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">No projects yet</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Create your first project to start collecting items.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <ProjectCard
          key={p.id}
          id={p.id}
          title={p.name}
          description={p.description}
          itemCount={Math.floor(Math.random() * 50) + 5} // Mock data for visual appeal
          updatedAt="2 days ago" // Mock data
          onClick={() => router.push(`/dashboard/projects/${p.id}`)}
          onEdit={() => onEdit(p)}
          onDelete={() => onDelete(p.id)}
        />
      ))}
    </div>
  );
}
