import { fmt } from "@/lib/formatters";
import { Gain, ConvictionDot } from "@/components/ui";
import type { PhoenixData } from "@/lib/data";

type Asset = PhoenixData["assets"][number];

interface Props {
  assets: Asset[];
}

export default function TopHoldings({ assets }: Props) {
  const top5 = [...assets].sort((a, b) => b.current - a.current).slice(0, 5);

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
        Top Holdings
      </div>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["Company", "Value", "Gain/%", "Conv"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: h === "Company" ? "left" : "right",
                  paddingBottom: 8,
                  fontSize: 11,
                  color: "var(--muted)",
                  fontWeight: 500,
                  letterSpacing: ".04em",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {top5.map((a) => (
            <tr
              key={a.id}
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <td
                style={{
                  padding: "10px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text)" }}>
                    {a.ticker}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    {a.name.slice(0, 22)}
                  </div>
                </div>
              </td>
              <td
                style={{
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text)",
                }}
              >
                {fmt(a.current)}
              </td>
              <td style={{ textAlign: "right" }}>
                <Gain value={a.gain} pct={a.gainPct} />
              </td>
              <td style={{ textAlign: "right" }}>
                <ConvictionDot score={a.conviction} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
