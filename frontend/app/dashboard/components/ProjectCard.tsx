"use client";

import { Folder, MoreVertical, Edit2, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProjectCardProps {
    id: string;
    title: string;
    description?: string;
    itemCount?: number; // Mocked for now if not available
    updatedAt?: string; // Mocked for now
    onEdit: () => void;
    onDelete: () => void;
    onClick: () => void;
}

export default function ProjectCard({
    id,
    title,
    description,
    itemCount = 0,
    updatedAt = "Just now",
    onEdit,
    onDelete,
    onClick,
}: ProjectCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    // Generate a deterministic color based on the title length for variety
    const colors = [
        "text-violet-500 bg-violet-500/10",
        "text-cyan-500 bg-cyan-500/10",
        "text-pink-500 bg-pink-500/10",
        "text-emerald-500 bg-emerald-500/10",
        "text-amber-500 bg-amber-500/10",
    ];
    const colorClass = colors[title.length % colors.length];

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--primary)]/50 hover:shadow-lg hover:shadow-[var(--primary)]/5 cursor-pointer"
        >
            <div className="flex items-start justify-between">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl transition-colors group-hover:bg-[var(--background)]", colorClass)}>
                    <Folder size={24} />
                </div>

                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                }}
                            />
                            <div className="absolute right-0 top-full z-20 mt-2 w-32 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--popover)] shadow-xl animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                        onEdit();
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                                >
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                        onDelete();
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-4 flex-1">
                <h3 className="text-lg font-semibold text-[var(--foreground)] line-clamp-1">{title}</h3>
                <p className="mt-1 text-sm text-[var(--muted-foreground)] line-clamp-2">
                    {description || "No description provided."}
                </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-[var(--foreground)]">{itemCount} Items</span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">Updated {updatedAt}</span>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition-colors group-hover:border-[var(--primary)] group-hover:text-[var(--primary)]">
                    <ArrowRight size={14} />
                </div>
            </div>
        </div>
    );
}
