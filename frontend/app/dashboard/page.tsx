"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatsCard from "./components/StatsCard";
import ProjectsGrid from "./components/ProjectsGrid";
import { Box, Layers, TrendingUp, Users } from "lucide-react";
import type { DashboardProjectSummary } from "./components/ProjectsGrid";

type ApiUser = {
  id: string;
  email: string;
  name?: string | null;
};

type ApiProject = {
  id: string;
  title: string;
  description?: string | null;
  created_at?: string;
};

type ApiForm = {
  id: string;
  project_id: string;
  title: string;
  slug: string;
  created_at?: string;
};

type ApiSubmission = {
  id: string;
  form_id: string;
  created_at: string;
};

function getApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL as string) || "http://127.0.0.1:8000";
}

function getAuthHeaders(): Record<string, string> | undefined {
  const devToken = typeof window !== "undefined" ? localStorage.getItem("dev_access_token") : null;
  if (!devToken) return undefined;
  return { Authorization: `Bearer ${devToken}` };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<DashboardProjectSummary[]>([]);
  const [stats, setStats] = useState<{
    totalProjects: number;
    totalSubmissions: number;
    totalForms: number;
    formsWithSubmissions: number;
  }>({ totalProjects: 0, totalSubmissions: 0, totalForms: 0, formsWithSubmissions: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let willRedirect = false;
    const base = getApiBase();
    const headers = getAuthHeaders();

    async function load() {
      try {
        setError(null);

        const meRes = await fetch(`${base}/auth/me`, {
          credentials: "include",
          cache: "no-store",
          headers,
        });
        if (!meRes.ok) throw new Error("unauthorized");
        const me: ApiUser = await meRes.json();
        if (!mounted) return;
        setUser(me);

        const projectsRes = await fetch(`${base}/projects/`, {
          credentials: "include",
          cache: "no-store",
          headers,
        });
        if (!projectsRes.ok) throw new Error("failed_projects");
        const apiProjects: ApiProject[] = (await projectsRes.json()) || [];
        if (!mounted) return;

        const projectSummaries: DashboardProjectSummary[] = await Promise.all(
          apiProjects.map(async (p) => {
            const formsRes = await fetch(`${base}/projects/${p.id}/forms`, {
              credentials: "include",
              cache: "no-store",
              headers,
            });
            const forms: ApiForm[] = formsRes.ok ? (await formsRes.json()) || [] : [];

            let submissionsCount = 0;
            let formsWithSubmissionsCount = 0;

            for (const form of forms) {
              // submissions list is currently public in the backend (no auth required), but we still
              // pass credentials for same-origin deployments.
              const subsRes = await fetch(`${base}/forms/${form.id}/submissions`, {
                credentials: "include",
                cache: "no-store",
                headers,
              });
              const subs: ApiSubmission[] = subsRes.ok ? (await subsRes.json()) || [] : [];
              submissionsCount += subs.length;
              if (subs.length > 0) formsWithSubmissionsCount += 1;
            }

            return {
              id: String(p.id),
              title: p.title,
              submissionsCount,
              formsCount: forms.length,
              formsWithSubmissionsCount,
            };
          })
        );

        if (!mounted) return;

        const totalProjects = projectSummaries.length;
        const totalForms = projectSummaries.reduce((acc, x) => acc + x.formsCount, 0);
        const formsWithSubmissions = projectSummaries.reduce((acc, x) => acc + x.formsWithSubmissionsCount, 0);
        const totalSubmissions = projectSummaries.reduce((acc, x) => acc + x.submissionsCount, 0);
        setStats({ totalProjects, totalSubmissions, totalForms, formsWithSubmissions });
        setProjects(projectSummaries);
      } catch (e: unknown) {
        if (!mounted) return;
        const msg = e instanceof Error ? e.message : "error";
        if (msg === "unauthorized") {
          willRedirect = true;
          router.push("/auth/login");
          return;
        }
        setError("Failed to load dashboard data.");
      } finally {
        if (mounted && !willRedirect) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  const name = (user && (user.name || user.email)) || "User";
  const engagement = stats.totalForms
    ? Math.round((stats.formsWithSubmissions / stats.totalForms) * 100)
    : 0;

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Welcome back, {name}</h1>
        <p className="text-[var(--muted-foreground)]">Here&apos;s what&apos;s happening with your projects today.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted-foreground)]">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Projects"
          value={String(stats.totalProjects)}
          subtitle="Projects you own"
          trend="neutral"
          icon={Layers}
          color="text-violet-500"
        />
        <StatsCard
          title="Total Items"
          value={String(stats.totalSubmissions)}
          subtitle="Total submissions across forms"
          trend="neutral"
          icon={Box}
          color="text-cyan-500"
        />
        <StatsCard
          title="Team Members"
          value="1"
          subtitle="Owner only"
          trend="neutral"
          icon={Users}
          color="text-pink-500"
        />
        <StatsCard
          title="Engagement"
          value={`${engagement}%`}
          subtitle="Forms with ≥1 submission"
          trend="neutral"
          icon={TrendingUp}
          color="text-emerald-500"
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Active Projects</h2>
          <button className="text-sm font-medium text-[var(--primary)] hover:underline">View All</button>
        </div>
        <ProjectsGrid projects={projects} />
      </section>
    </div>
  );
}
