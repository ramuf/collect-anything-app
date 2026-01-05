"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	LayoutDashboard,
	FolderOpen,
	CheckSquare,
	Settings,
	LogOut,
	ChevronLeft,
	ChevronRight,
	PlusCircle,
	Search,
	Users
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
	{ icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
	{ icon: FolderOpen, label: "Projects", href: "/dashboard/projects" },
	{ icon: CheckSquare, label: "Tasks", href: "/dashboard/tasks" },
	{ icon: Users, label: "Team", href: "/dashboard/team" },
	{ icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar() {
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(false);
	const [mounted, setMounted] = useState(false);

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
				<div className={cn("flex items-center gap-2 overflow-hidden", collapsed && "justify-center")}>
					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white shadow-lg shadow-[var(--primary)]/20">
						<span className="text-lg font-bold">C</span>
					</div>
					{!collapsed && (
						<span className="text-lg font-bold tracking-tight text-white animate-in fade-in duration-300">
							Collect
						</span>
					)}
				</div>
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
					<div className="mb-6 px-2">
						<button className="flex w-full items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[var(--primary)]/25 transition-transform hover:scale-[1.02] active:scale-[0.98]">
							<PlusCircle size={18} />
							<span>New Project</span>
						</button>
					</div>
				)}

				<nav className="space-y-1">
					{navItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}
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
						);
					})}
				</nav>
				</div>
			</ScrollArea>

			<div className="absolute bottom-4 left-0 w-full px-3">
				<button
					className={cn(
						"flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]",
						collapsed && "justify-center"
					)}
				>
					<LogOut size={20} />
					{!collapsed && <span>Logout</span>}
				</button>
			</div>
		</aside>
	);
}
