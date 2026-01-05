"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    FileText,
    Database,
    Table,
    Settings,
    ChevronLeft,
    ChevronRight,
    ArrowLeft
    , Search
} from "lucide-react";
import { useState, useEffect } from "react";

const contentNav = [
    { id: 'forms', label: 'Forms', icon: FileText, href: (id: string) => `/dashboard/projects/${id}/forms` },
    { id: 'data', label: 'Data', icon: Database, href: (id: string) => `/dashboard/projects/${id}/data` },
    { id: 'views', label: 'Views', icon: Table, href: (id: string) => `/dashboard/projects/${id}/views` },
];

const settingsNav = [
    { id: 'settings', label: 'Settings', icon: Settings, href: (id: string) => `/dashboard/projects/${id}/settings` },
];

export default function ProjectSidebar() {
    const params = useParams();
    const pathname = usePathname();
    const projectId = params.uuid as string;
    const [collapsed, setCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const width = collapsed ? '4rem' : '16rem';
        document.documentElement.style.setProperty('--sidebar-width', width);
    }, [collapsed]);

    if (!mounted) return null;

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen flex flex-col overflow-hidden border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--sidebar-foreground)] transition-all duration-300 ease-in-out",
                collapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width)]"
            )}
        >
            <div className="flex h-[var(--header-height)] items-center justify-between px-4">
                <Link
                    href="/dashboard/projects"
                    className={cn("flex items-center gap-2 overflow-hidden text-[var(--muted-foreground)] hover:text-white transition-colors", collapsed && "justify-center")}
                >
                    <ArrowLeft size={20} />
                    {!collapsed && (
                        <span className="text-sm font-medium animate-in fade-in duration-300">
                            Back to Projects
                        </span>
                    )}
                </Link>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-white transition-colors",
                        collapsed && "absolute -right-3 top-8 z-50 h-6 w-6 rounded-full border border-[var(--sidebar-border)] bg-[var(--sidebar)] shadow-md"
                    )}
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>

            <ScrollArea className="flex-1">
                <div className="px-3 py-4">
                {!collapsed && (
                    <div className="mb-3 px-2">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                            Project Menu
                        </h2>
                    </div>
                )}

                {/* Content group */}
                <div className="mb-2 px-2">
                    <h3 className="text-xs font-medium text-[var(--muted-foreground)]">Content</h3>
                </div>
                <nav className="space-y-1 mb-4">
                    {contentNav.map((item) => {
                        const href = item.href(projectId);
                        const isActive = item.id === 'forms'
                            ? pathname === href || pathname.includes('/forms/')
                            : pathname.startsWith(href);
                        return (
                            <Link
                                key={item.id}
                                href={href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-[var(--sidebar-accent)] text-white shadow-md shadow-black/10"
                                        : "text-[var(--muted-foreground)] hover:bg-[var(--sidebar-accent)]/50 hover:text-white"
                                )}
                            >
                                <item.icon
                                    size={20}
                                    className={cn(
                                        "shrink-0 transition-colors",
                                        isActive ? "text-[var(--accent)]" : "text-[var(--muted-foreground)] group-hover:text-white"
                                    )}
                                />
                                {!collapsed && <span>{item.label}</span>}
                                {collapsed && isActive && (
                                    <div className="absolute left-1 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[var(--accent)]" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Settings group */}
                <div className="mb-2 px-2">
                    <h3 className="text-xs font-medium text-[var(--muted-foreground)]">Project</h3>
                </div>
                <nav className="space-y-1">
                    {settingsNav.map((item) => {
                        const href = item.href(projectId);
                        const isActive = pathname.startsWith(href);
                        return (
                            <Link
                                key={item.id}
                                href={href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-[var(--sidebar-accent)] text-white shadow-md shadow-black/10"
                                        : "text-[var(--muted-foreground)] hover:bg-[var(--sidebar-accent)]/50 hover:text-white"
                                )}
                            >
                                <item.icon
                                    size={20}
                                    className={cn(
                                        "shrink-0 transition-colors",
                                        isActive ? "text-[var(--accent)]" : "text-[var(--muted-foreground)] group-hover:text-white"
                                    )}
                                />
                                {!collapsed && <span>{item.label}</span>}
                                {collapsed && isActive && (
                                    <div className="absolute left-1 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[var(--accent)]" />
                                )}
                            </Link>
                        )
                    })}
                </nav>
                </div>
            </ScrollArea>
        </aside>
    );
}
