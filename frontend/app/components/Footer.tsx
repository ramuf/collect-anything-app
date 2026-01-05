export default function Footer() {
  return (
    <footer className="border-t bg-transparent py-8 border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-[var(--muted-foreground)]">© {new Date().getFullYear()} Collect Anything</div>
          <div className="flex gap-4 text-sm">
            <a href="#" className="text-[var(--muted-foreground)] hover:underline">Privacy</a>
            <a href="#" className="text-[var(--muted-foreground)] hover:underline">Terms</a>
            <a href="#" className="text-[var(--muted-foreground)] hover:underline">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
