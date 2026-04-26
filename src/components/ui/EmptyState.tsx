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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "60px 20px",
        color: "var(--muted)",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 32 }}>{icon}</span>
      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
        {title}
      </span>
      {sub && <span style={{ fontSize: 13 }}>{sub}</span>}
    </div>
  );
}
