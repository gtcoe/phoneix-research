import { fmt } from "@/lib/formatters";
import type { PhoenixData } from "@/types";

export function RiskTab({ data }: { data: PhoenixData }) {
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
    >
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
          Risk Metrics
        </div>
        {[
          {
            label: "Portfolio Beta",
            value: "0.87",
            note: "Lower than market",
          },
          {
            label: "Portfolio XIRR",
            value: `${data.xirr.toFixed(1)}%`,
            note: "Annualised return",
          },
          {
            label: "Alpha vs Nifty50",
            value: `+${data.alpha.toFixed(1)}%`,
            note: "Outperformance",
          },
          {
            label: "Sharpe Ratio",
            value: "1.42",
            note: "Risk-adjusted return",
          },
          {
            label: "Max Drawdown",
            value: "-18.3%",
            note: "Historical peak-to-trough",
          },
          {
            label: "STCG Holdings",
            value: `${data.assets.filter((a) => !a.isLTCG).length}`,
            note: `${data.assets.filter((a) => !a.isLTCG).length} positions < 1yr`,
          },
          {
            label: "LTCG Holdings",
            value: `${data.assets.filter((a) => a.isLTCG).length}`,
            note: `${data.assets.filter((a) => a.isLTCG).length} positions ≥ 1yr`,
          },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div>
              <div style={{ fontSize: 13, color: "var(--text)" }}>
                {m.label}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                {m.note}
              </div>
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div>
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
          Tax Summary
        </div>
        {[
          {
            label: "Total Gains",
            value: fmt(data.totalGains),
            color: "var(--gain)",
          },
          {
            label: "Total Tax",
            value: fmt(data.totalTax),
            color: "var(--loss)",
          },
          {
            label: "Post-tax Gains",
            value: fmt(data.postTaxGains),
            color: "var(--accent)",
          },
        ].map((r) => (
          <div
            key={r.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              {r.label}
            </span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: r.color,
                fontFamily: "var(--font-mono)",
              }}
            >
              {r.value}
            </span>
          </div>
        ))}
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontSize: 12,
              color: "var(--muted)",
              marginBottom: 10,
            }}
          >
            Per-stock tax breakdown
          </div>
          {/* Column headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "100px 80px 80px 1fr",
              padding: "4px 0",
              marginBottom: 4,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: "var(--muted)",
                letterSpacing: ".04em",
              }}
            >
              STOCK
            </span>
            <span
              style={{
                fontSize: 10,
                color: "var(--muted)",
                letterSpacing: ".04em",
              }}
            >
              TAX TYPE
            </span>
            <span
              style={{
                fontSize: 10,
                color: "var(--muted)",
                letterSpacing: ".04em",
                textAlign: "right",
              }}
            >
              TAX
            </span>
            <span
              style={{
                fontSize: 10,
                color: "var(--muted)",
                letterSpacing: ".04em",
                textAlign: "right",
              }}
            >
              POST-TAX GAIN
            </span>
          </div>
          {data.assets.map((a) => (
            <div
              key={a.id}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 80px 80px 1fr",
                padding: "7px 0",
                borderBottom: "1px solid var(--border)",
                fontSize: 12,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--text)",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {a.ticker ?? a.category}
              </span>
              <span style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                {a.taxRate != null
                  ? a.isLTCG
                    ? "LTCG 10%"
                    : "STCG 15%"
                  : "—"}
              </span>
              <span
                style={{
                  color: "var(--loss)",
                  fontFamily: "var(--font-mono)",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                {a.taxAmt != null && a.taxAmt > 0
                  ? `-${fmt(a.taxAmt)}`
                  : "—"}
              </span>
              <span
                style={{
                  color: a.postTaxGain >= 0 ? "var(--gain)" : "var(--loss)",
                  fontFamily: "var(--font-mono)",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                {fmt(a.postTaxGain)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
