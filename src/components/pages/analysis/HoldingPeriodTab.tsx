import { Gain } from "@/components/ui";
import type { PhoenixData } from "@/types";

export function HoldingPeriodTab({ data }: { data: PhoenixData }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: 16,
        }}
      >
        Holding Period Analysis
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
      >
        {[
          {
            label: "LTCG (≥ 1yr)",
            assets: data.assets.filter((a) => a.isLTCG),
            color: "var(--gain)",
          },
          {
            label: "STCG (< 1yr)",
            assets: data.assets.filter((a) => !a.isLTCG),
            color: "var(--warn)",
          },
        ].map((group) => (
          <div
            key={group.label}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: group.color,
                marginBottom: 12,
              }}
            >
              {group.label} — {group.assets.length} stocks
            </div>
            {group.assets.map((a) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 12,
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "var(--text)",
                      fontFamily: "var(--font-mono)",
                      marginRight: 8,
                    }}
                  >
                    {a.ticker}
                  </span>
                  <span style={{ color: "var(--muted)" }}>
                    {a.holdingDays != null ? `${a.holdingDays}d` : "—"}
                  </span>
                </div>
                <Gain value={a.gain} pct={a.gainPct} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
