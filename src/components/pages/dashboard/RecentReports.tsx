import { Badge } from "@/components/ui";
import type { Report } from "@/types/report";

interface Props {
  reports: Report[];
}

export default function RecentReports({ reports }: Props) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-4 px-5">
      <div className="text-sm font-semibold text-[var(--text)] mb-3.5">
        Recent Reports
      </div>
      <div
        className="grid gap-[10px]"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
      >
        {reports.slice(0, 4).map((r) => (
          <a
            key={r.slug}
            href={r.file ? `/analyses/${r.file.replace(/^analyses\//, "")}` : "#"}
            target="_blank"
            rel="noreferrer"
            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg py-3 px-[14px] no-underline block transition-[border-color] duration-150"
          >
            <div className="flex justify-between mb-1">
              <span className="text-xs font-bold text-[var(--accent)] font-[var(--font-mono)]">
                {r.ticker ?? r.name}
              </span>
              <Badge rec={r.rec} size="xs" />
            </div>
            <div className="text-xs text-[var(--text)] font-medium">
              {r.name}
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-1">
              {r.date}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
