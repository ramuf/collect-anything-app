"use client";

import { useRouter } from "next/navigation";
import { Folder, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardProjectSummary = {
    id: string;
    title: string;
    submissionsCount: number;
    formsCount: number;
    formsWithSubmissionsCount: number;
};

function getProjectColorClasses(title: string): { icon: string; bar: string } {
    const palette = [
        { icon: "text-violet-500", bar: "bg-violet-500" },
        { icon: "text-cyan-500", bar: "bg-cyan-500" },
        { icon: "text-pink-500", bar: "bg-pink-500" },
        { icon: "text-emerald-500", bar: "bg-emerald-500" },
        { icon: "text-amber-500", bar: "bg-amber-500" },
    ];
    return palette[title.length % palette.length];
}

export default function ProjectsGrid({
    projects,
}: {
    projects: DashboardProjectSummary[];
}) {
    const router = useRouter();

    if (!projects.length) {
        return (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-10 text-center">
                <h4 className="text-sm font-medium text-[var(--foreground)]">No projects yet</h4>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">Create a project to start collecting items.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {projects.map((project) => {
                const colors = getProjectColorClasses(project.title);
                const progress = project.formsCount
                    ? Math.round((project.formsWithSubmissionsCount / project.formsCount) * 100)
                    : 0;

                return (
                    <div
                        key={project.id}
                        className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--primary)]/50 hover:shadow-lg hover:shadow-[var(--primary)]/5"
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                router.push(`/dashboard/projects/${project.id}`);
                            }
                        }}
                    >
                        <div className="flex items-start justify-between">
                            <div
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--secondary)]",
                                    colors.icon
                                )}
                            >
                                <Folder size={20} />
                            </div>
                            <button
                                className="text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--foreground)]"
                                aria-label="Project menu"
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <MoreVertical size={16} />
                            </button>
                        </div>

                        <div className="mt-4">
                            <h4 className="font-medium text-[var(--foreground)] line-clamp-1">{project.title}</h4>
                            <p className="text-xs text-[var(--muted-foreground)]">
                                {project.submissionsCount} items · {project.formsCount} forms
                            </p>
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                                <span>Progress</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--secondary)]">
                                <div
                                    className={cn("h-full rounded-full", colors.bar)}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
