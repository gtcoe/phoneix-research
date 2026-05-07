"use client";

export function EmptyState({
  icon = "📊",
  title,
  sub,
}: {
  icon?: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center py-[60px] px-5 text-[var(--muted)] gap-2">
      <span className="text-[32px]">{icon}</span>
      <span className="text-base font-semibold text-[var(--text)]">
        {title}
      </span>
      {sub && <span className="text-sm">{sub}</span>}
    </div>
  );
}
