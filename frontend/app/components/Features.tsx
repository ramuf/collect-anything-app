export default function Features() {
  return (
    <section id="features" className="mt-16 grid gap-8 sm:mt-20 lg:grid-cols-3">
      <div className="rounded-xl border p-6 shadow-sm bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)]/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--primary)]">
            <path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">Flexible Data</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Create forms and collections with rich field types and validations.</p>
      </div>

      <div className="rounded-xl border p-6 shadow-sm bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--secondary)]/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--secondary)]">
            <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">Collaboration</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Invite teammates, comment, and manage permissions with ease.</p>
      </div>

      <div className="rounded-xl border p-6 shadow-sm bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent)]/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--accent)]">
            <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">Integrations</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Connect with your favorite tools and automate workflows.</p>
      </div>
    </section>
  );
}
