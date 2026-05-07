import { fmt } from "@/lib/formatters";
import { Gain, AreaChart } from "@/components/ui";
import type { PhoenixData } from "@/types";

export function PerformanceTab({ data }: { data: PhoenixData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Portfolio vs benchmarks */}
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
          Portfolio vs Benchmarks
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: "Portfolio XIRR",
              value: `${data.xirr.toFixed(1)}%`,
              color: "var(--accent)",
            },
            {
              label: "Nifty 50 XIRR",
              value: `${data.benchmarks.nifty50.xirr.toFixed(1)}%`,
              color: "#6366f1",
            },
            {
              label: "Midcap 150 XIRR",
              value: `${data.benchmarks.midcap150.xirr.toFixed(1)}%`,
              color: "#f59e0b",
            },
            {
              label: "Fixed Deposit",
              value: `${data.benchmarks.fd.xirr.toFixed(1)}%`,
              color: "#10b981",
            },
          ].map((b) => (
            <div
              key={b.label}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  marginBottom: 4,
                }}
              >
                {b.label}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: b.color,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {b.value}
              </div>
            </div>
          ))}
        </div>
        <AreaChart
          data={data.history}
          width={860}
          height={180}
          color="var(--accent)"
          labelKey="date"
          valueKey="value"
        />
      </div>

      {/* Individual stock performance */}
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
            marginBottom: 14,
          }}
        >
          Individual Stock Returns
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Column headers */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 4,
            }}
          >
            <div style={{ width: 100 }} />
            <div style={{ flex: 1 }} />
            <div
              style={{
                width: 60,
                textAlign: "right",
                fontSize: 10,
                color: "var(--muted)",
                letterSpacing: ".04em",
              }}
            >
              GAIN
            </div>
            <div
              style={{
                width: 52,
                textAlign: "right",
                fontSize: 10,
                color: "var(--muted)",
                letterSpacing: ".04em",
              }}
            >
              XIRR
            </div>
          </div>
          {[...data.assets]
            .sort((a, b) => b.gainPct - a.gainPct)
            .map((a) => {
              const w = Math.min(
                100,
                Math.max(0, (Math.abs(a.gainPct) / 200) * 100),
              );
              return (
                <div
                  key={a.id}
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <div
                    style={{
                      width: 100,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text)",
                      fontFamily: "var(--font-mono)",
                      textAlign: "right",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {a.ticker ?? a.category}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "50%",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      {a.gainPct < 0 && (
                        <div
                          style={{
                            width: `${w}%`,
                            maxWidth: "100%",
                            height: 20,
                            background: "var(--loss)",
                            borderRadius: "4px 0 0 4px",
                            opacity: 0.7,
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        width: 1,
                        height: 28,
                        background: "var(--border)",
                      }}
                    />
                    <div style={{ width: "50%" }}>
                      {a.gainPct >= 0 && (
                        <div
                          style={{
                            width: `${w}%`,
                            maxWidth: "100%",
                            height: 20,
                            background: "var(--gain)",
                            borderRadius: "0 4px 4px 0",
                            opacity: 0.7,
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 60,
                      textAlign: "right",
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      color: a.gainPct >= 0 ? "var(--gain)" : "var(--loss)",
                    }}
                  >
                    {a.gainPct >= 0 ? "+" : ""}
                    {a.gainPct.toFixed(1)}%
                  </div>
                  <div
                    style={{
                      width: 52,
                      textAlign: "right",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      whiteSpace: "nowrap",
                      color:
                        (a.xirr ?? 0) >= 15
                          ? "var(--gain)"
                          : (a.xirr ?? 0) >= 0
                            ? "var(--warn)"
                            : "var(--loss)",
                    }}
                  >
                    {a.xirr != null ? `${a.xirr.toFixed(1)}%` : "—"}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
