"use client";
import { fmt } from "@/lib/formatters";
import type { PhoenixData } from "@/types";

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
    <div className="grid grid-cols-2 gap-5">
      <div>
        <div className="text-sm font-semibold text-[var(--text)] mb-4">
          Tax Summary (FY 2025-26)
        </div>
        {summaryRows.map((r) => (
          <div
            key={r.label}
            className="flex justify-between py-[10px] border-b border-[var(--border)]"
          >
            <span className="text-sm text-[var(--muted)]">
              {r.label}
            </span>
            <span
              className="text-sm font-bold font-[var(--font-mono)]"
              style={{ color: r.color }}
            >
              {fmt(Math.abs(r.value))}
              {r.value < 0 ? " debit" : ""}
            </span>
          </div>
        ))}
      </div>
      <div>
        <div className="text-sm font-semibold text-[var(--text)] mb-4">
          Per-Stock Breakdown
        </div>
        <div className="overflow-y-auto max-h-[400px]">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {["Ticker", "Type", "Gain", "Tax", "Post-Tax"].map((h) => (
                  <th
                    key={h}
                    className={`py-1.5 px-[10px] text-[10px] text-[var(--muted)] font-medium ${h === "Ticker" ? "text-left" : "text-right"}`}
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
                  <tr key={a.id} className="border-b border-[var(--border)]">
                    <td className="py-2 px-[10px] font-semibold text-[var(--text)] font-[var(--font-mono)]">
                      {a.ticker ?? a.category}
                    </td>
                    <td className="py-2 px-[10px] text-right">
                      <span
                        className={`text-[10px] py-[2px] px-1.5 rounded-full font-semibold ${a.isLTCG ? "text-[var(--gain)]" : "text-[var(--warn)]"}`}
                        style={{
                          background: a.isLTCG
                            ? "rgba(16,185,129,.15)"
                            : "rgba(245,158,11,.15)",
                        }}
                      >
                        {a.isLTCG ? "LTCG" : a.isLTCG === false ? "STCG" : "—"}
                      </span>
                    </td>
                    <td
                      className={`py-2 px-[10px] text-right font-[var(--font-mono)] ${a.gain >= 0 ? "text-[var(--gain)]" : "text-[var(--loss)]"}`}
                    >
                      {fmt(a.gain)}
                    </td>
                    <td className="py-2 px-[10px] text-right text-[var(--loss)] font-[var(--font-mono)]">
                      {a.taxAmt != null ? `-${fmt(a.taxAmt)}` : "—"}
                    </td>
                    <td className="py-2 px-[10px] text-right text-[var(--gain)] font-[var(--font-mono)]">
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
