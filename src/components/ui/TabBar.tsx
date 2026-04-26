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
    <div
      style={{
        display: "flex",
        gap: 2,
        borderBottom: "1px solid var(--border)",
        marginBottom: 20,
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 500,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: active === t.id ? "var(--accent)" : "var(--muted)",
            borderBottom:
              active === t.id
                ? "2px solid var(--accent)"
                : "2px solid transparent",
            marginBottom: -1,
            transition: "color .15s",
            whiteSpace: "nowrap",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
