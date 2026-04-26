"use client";

export function HBarChart({
  data,
  height = 20,
}: {
  data: Array<{ label: string; value: number; pct?: number; color?: string }>;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 130,
              fontSize: 12,
              color: "var(--muted)",
              textAlign: "right",
              flexShrink: 0,
              fontFamily: "var(--font-mono)",
            }}
          >
            {d.label}
          </span>
          <div
            style={{
              flex: 1,
              background: "var(--border)",
              borderRadius: 99,
              height,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(d.value / max) * 100}%`,
                height: "100%",
                background: d.color || "var(--accent)",
                borderRadius: 99,
                transition: "width .4s ease",
                minWidth: 4,
              }}
            />
          </div>
          <span
            style={{
              width: 56,
              fontSize: 12,
              color: "var(--text)",
              fontWeight: 600,
              fontFamily: "var(--font-mono)",
            }}
          >
            {d.pct?.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}
