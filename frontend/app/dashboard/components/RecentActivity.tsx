export default function RecentActivity() {
  const items = [
    { id: 1, text: "Sofia commented on Research Notes", time: "2h" },
    { id: 2, text: "You uploaded 3 files to Autumn Archive", time: "1d" },
    { id: 3, text: "Project 'Home Gallery' created", time: "3d" },
  ];

  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.id} className="flex items-start gap-3">
          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-[var(--muted)]" />
          <div className="flex-1">
            <p className="text-sm">{it.text}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{it.time}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
