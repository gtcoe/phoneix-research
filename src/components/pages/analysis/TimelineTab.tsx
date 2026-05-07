import { fmt } from "@/lib/formatters";
import { Badge, Gain } from "@/components/ui";
import { pd } from "@/lib/date";
import type { PhoenixData } from "@/types";

export function TimelineTab({ data }: { data: PhoenixData }) {
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
        Investment Timeline
      </div>
      <div style={{ position: "relative", paddingLeft: 24 }}>
        <div
          style={{
            position: "absolute",
            left: 6,
            top: 0,
            bottom: 0,
            width: 2,
            background: "var(--border)",
          }}
        />
        {[...data.assets]
          .sort(
            (a, b) =>
              (a.entryDate ? (pd(a.entryDate)?.getTime() ?? 0) : 0) -
              (b.entryDate ? (pd(b.entryDate)?.getTime() ?? 0) : 0),
          )
          .map((a) => (
            <div
              key={a.id}
              style={{ position: "relative", marginBottom: 20 }}
            >
              <div
                style={{
                  position: "absolute",
                  left: -21,
                  top: 4,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background:
                    a.gainPct >= 0 ? "var(--gain)" : "var(--loss)",
                  border: "2px solid var(--surface)",
                }}
              />
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "10px 14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--accent)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {a.ticker}
                    </span>
                    <Badge rec={a.rec} size="xs" />
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      {a.holdingDays != null
                        ? `${a.holdingDays}d holding`
                        : "no entry date"}
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {a.entryDate ?? "—"}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    Entry:{" "}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--text)",
                      }}
                    >
                      {fmt(a.entryPrice)}
                    </span>
                  </span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    Current:{" "}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--text)",
                      }}
                    >
                      {fmt(a.currentPrice)}
                    </span>
                  </span>
                  <Gain value={a.gain} pct={a.gainPct} />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
