import { fmt } from "@/lib/formatters";
import type { PhoenixData } from "@/types";

export function DrawdownTab({ data }: { data: PhoenixData }) {
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
        Drawdown Analysis
      </div>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {[
              "Stock",
              "Entry",
              "ATH",
              "Current",
              "Max DD",
              "Cur DD",
              "Recovery Needed",
            ].map((h) => (
              <th
                key={h}
                style={{
                  padding: "8px 10px",
                  textAlign: h === "Stock" ? "left" : "right",
                  fontSize: 11,
                  color: "var(--muted)",
                  fontWeight: 500,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.drawdowns.map((d) => (
            <tr
              key={d.ticker}
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <td
                style={{
                  padding: "10px 10px",
                  fontWeight: 600,
                  color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {d.ticker}
              </td>
              <td
                style={{
                  padding: "10px 10px",
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                  color: "var(--muted)",
                  fontSize: 12,
                }}
              >
                {fmt(d.entry)}
              </td>
              <td
                style={{
                  padding: "10px 10px",
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text)",
                  fontSize: 12,
                }}
              >
                {fmt(d.ath)}
              </td>
              <td
                style={{
                  padding: "10px 10px",
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text)",
                  fontSize: 12,
                }}
              >
                {fmt(d.current)}
              </td>
              <td
                style={{
                  padding: "10px 10px",
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                  color: d.maxDD < -20 ? "var(--loss)" : "var(--warn)",
                  fontSize: 12,
                }}
              >
                {d.maxDD.toFixed(1)}%
              </td>
              <td
                style={{
                  padding: "10px 10px",
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                  color:
                    d.curDD < -10
                      ? "var(--loss)"
                      : d.curDD < 0
                        ? "var(--warn)"
                        : "var(--gain)",
                  fontSize: 12,
                }}
              >
                {d.curDD.toFixed(1)}%
              </td>
              <td
                style={{
                  padding: "10px 10px",
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                  color:
                    d.recoveryNeeded > 20
                      ? "var(--loss)"
                      : d.recoveryNeeded > 0
                        ? "var(--warn)"
                        : "var(--gain)",
                  fontSize: 12,
                }}
              >
                {d.recoveryNeeded > 0
                  ? `+${d.recoveryNeeded.toFixed(1)}%`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
