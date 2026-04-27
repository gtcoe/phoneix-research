import type { ConvictionAlert } from "@/types/alert";

interface Props {
  alerts: ConvictionAlert[];
}

export default function ConvictionAlertsCard({ alerts }: Props) {
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
        Conviction Alerts
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {alerts.slice(0, 6).map((a) => (
          <div
            key={a.id}
            style={{ display: "flex", gap: 10, opacity: a.read ? 0.55 : 1 }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                marginTop: 4,
                flexShrink: 0,
                background:
                  a.severity === "high"
                    ? "var(--loss)"
                    : a.severity === "medium"
                      ? "var(--warn)"
                      : "var(--info)",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text)",
                }}
              >
                {a.ticker} — {a.type}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  lineHeight: 1.4,
                }}
              >
                {a.message}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
