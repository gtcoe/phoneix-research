// @ts-nocheck
"use client";
import { fmt } from "@/lib/formatters";
import type { PhoenixData } from "@/lib/data";

export function TaxPL({ data }: { data: PhoenixData }) {
  const ltcg = data.assets.filter((a) => a.isLTCG);
  const stcg = data.assets.filter((a) => !a.isLTCG);

  const totalLTCGGain = ltcg.reduce((s, a) => s + a.gain, 0);
  const totalSTCGGain = stcg.reduce((s, a) => s + a.gain, 0);
  const totalLTCGTax = ltcg.reduce((s, a) => s + (a.taxAmt ?? 0), 0);
  const totalSTCGTax = stcg.reduce((s, a) => s + (a.taxAmt ?? 0), 0);

  const summaryRows = [
    {
      label: "LTCG Gains (≥1yr @ 10%)",
      value: totalLTCGGain,
      color: totalLTCGGain >= 0 ? "var(--gain)" : "var(--loss)",
    },
    { label: "LTCG Tax Liability", value: -totalLTCGTax, color: "var(--loss)" },
    {
      label: "STCG Gains (<1yr @ 15%)",
      value: totalSTCGGain,
      color: totalSTCGGain >= 0 ? "var(--gain)" : "var(--loss)",
    },
    { label: "STCG Tax Liability", value: -totalSTCGTax, color: "var(--loss)" },
    {
      label: "Total Tax",
      value: -(totalLTCGTax + totalSTCGTax),
      color: "var(--loss)",
    },
    {
      label: "Post-Tax Gains",
      value: data.postTaxGains,
      color: "var(--accent)",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 16,
          }}
        >
          Tax Summary (FY 2025-26)
        </div>
        {summaryRows.map((r) => (
          <div
            key={r.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              {r.label}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: r.color,
                fontFamily: "var(--font-mono)",
              }}
            >
              {fmt(Math.abs(r.value))}
              {r.value < 0 ? " debit" : ""}
            </span>
          </div>
        ))}
      </div>
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 16,
          }}
        >
          Per-Stock Breakdown
        </div>
        <div style={{ overflowY: "auto", maxHeight: 400 }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Ticker", "Type", "Gain", "Tax", "Post-Tax"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "6px 10px",
                      textAlign: h === "Ticker" ? "left" : "right",
                      fontSize: 10,
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
              {[...data.assets]
                .sort((a, b) => b.gain - a.gain)
                .map((a) => (
                  <tr
                    key={a.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td
                      style={{
                        padding: "8px 10px",
                        fontWeight: 600,
                        color: "var(--text)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {a.ticker ?? a.category}
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 99,
                          background: a.isLTCG
                            ? "rgba(16,185,129,.15)"
                            : "rgba(245,158,11,.15)",
                          color: a.isLTCG ? "var(--gain)" : "var(--warn)",
                          fontWeight: 600,
                        }}
                      >
                        {a.isLTCG ? "LTCG" : a.isLTCG === false ? "STCG" : "—"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        textAlign: "right",
                        color: a.gain >= 0 ? "var(--gain)" : "var(--loss)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {fmt(a.gain)}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        textAlign: "right",
                        color: "var(--loss)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {a.taxAmt != null ? `-${fmt(a.taxAmt)}` : "—"}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        textAlign: "right",
                        color: "var(--gain)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {fmt(a.postTaxGain)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
