import Link from 'next/link'

export default function LandingHero() {
  return (
    <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div className="max-w-xl">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl text-[var(--foreground)]">
          Collect Anything. Organize Everything.
        </h1>
        <p className="mt-6 text-lg text-[var(--muted-foreground)]">
          A simple, powerful way to gather, categorize and collaborate on
          content and collections — from ideas and notes to files and forms.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold shadow-md transition hover:opacity-95 bg-[var(--primary)] text-[var(--primary-foreground)]"
          >
            Get Started — It's Free
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-medium shadow-sm border-[var(--border)] bg-transparent text-[var(--foreground)]"
          >
            View Features
          </a>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg p-4 shadow-sm bg-[var(--card)] text-[var(--card-foreground)] border-[var(--sidebar-border)]">
            <p className="text-sm font-semibold">For teams</p>
            <p className="text-sm text-[var(--muted-foreground)]">Collaborate with roles and permissions.</p>
          </div>
          <div className="rounded-lg p-4 shadow-sm bg-[var(--card)] text-[var(--card-foreground)] border-[var(--sidebar-border)]">
            <p className="text-sm font-semibold">Flexible schema</p>
            <p className="text-sm text-[var(--muted-foreground)]">Design forms and collections that match your workflow.</p>
          </div>
        </div>
      </div>

      <div className="order-first lg:order-last">
        <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-1 shadow-2xl">
          <div className="rounded-xl p-6 bg-[var(--card)] text-[var(--card-foreground)]">
            <div className="h-44 w-full rounded-md bg-gradient-to-tr from-slate-100 to-white dark:from-slate-900 dark:to-[#071025]" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Project: Autumn Archive</p>
                <p className="text-xs text-[var(--muted-foreground)]">34 items · 5 collaborators</p>
              </div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--muted-foreground)]">
                  <path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
