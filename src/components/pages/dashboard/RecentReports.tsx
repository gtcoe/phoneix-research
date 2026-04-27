import { Badge } from "@/components/ui";
import type { Report } from "@/types/report";

interface Props {
  reports: Report[];
}

export default function RecentReports({ reports }: Props) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "16px 20px",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: 14,
        }}
      >
        Recent Reports
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        {reports.slice(0, 4).map((r) => (
          <a
            key={r.slug}
            href={r.file ? `/analyses/${r.file.replace(/^analyses\//, "")}` : "#"}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "12px 14px",
              textDecoration: "none",
              display: "block",
              transition: "border-color .15s",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {r.ticker}
              </span>
              <Badge rec={r.rec} size="xs" />
            </div>
            <div
              style={{ fontSize: 12, color: "var(--text)", fontWeight: 500 }}
            >
              {r.name}
            </div>
            <div
              style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}
            >
              {r.date}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
