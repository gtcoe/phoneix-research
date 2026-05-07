"use client";

export function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: string; label: string }>;
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-0.5 border-b border-[var(--border)] mb-5">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`py-2 px-4 text-sm font-medium border-0 bg-transparent cursor-pointer -mb-px whitespace-nowrap transition-colors duration-150 border-b-2 ${active === t.id ? "text-[var(--accent)] border-b-[var(--accent)]" : "text-[var(--muted)] border-b-transparent"}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
