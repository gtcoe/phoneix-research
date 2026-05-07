"use client";
import { useState } from "react";
import { fmt, fmtPct } from "@/lib/formatters";
import { Icon } from "@/components/ui";
import type { PhoenixData } from "@/types";

export function ExportPDF({ data }: { data: PhoenixData }) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(["dashboard", "portfolio", "analysis"]),
  );
  const sections = [
    { id: "dashboard", label: "Dashboard Overview" },
    { id: "portfolio", label: "Portfolio Holdings" },
    { id: "analysis", label: "Performance Analysis" },
    { id: "compare", label: "Benchmark Comparison" },
    { id: "taxpl", label: "Tax & P/L Summary" },
    { id: "goals", label: "Goal Planning" },
  ];

  const toggleSection = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportPDF = () => {
    const content = `Phoenix Portfolio Report — ${new Date().toLocaleDateString()}
Portfolio Value: ${fmt(data.netWorth)}
XIRR: ${data.xirr.toFixed(1)}%
Total Gain: ${fmt(data.totalGains)} (${fmtPct(data.totalGainsPct)})

Holdings:
${data.assets.map((a) => `${a.ticker ?? a.category}: ${fmt(a.current)} | ${fmtPct(a.gainPct)} | XIRR ${a.xirr != null ? a.xirr.toFixed(1) + "%" : "—"}`).join("\n")}`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(
        `<pre style="font-family:monospace;padding:20px">${content}</pre>`,
      );
      w.setTimeout(() => w.print(), 500);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-5">
      <div>
        <div className="text-sm font-semibold text-[var(--text)] mb-4">
          Select Sections
        </div>
        {sections.map((s) => (
          <div
            key={s.id}
            className={`flex items-center gap-[10px] py-[10px] px-3.5 rounded-lg mb-2 cursor-pointer ${selected.has(s.id) ? "bg-[var(--accent-dim)]" : "bg-[var(--surface)]"}`}
            style={{ border: `1px solid ${selected.has(s.id) ? "var(--accent)" : "var(--border)"}` }}
            onClick={() => toggleSection(s.id)}
          >
            <div
              className={`w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 ${selected.has(s.id) ? "bg-[var(--accent)]" : "bg-transparent"}`}
              style={{ border: `2px solid ${selected.has(s.id) ? "var(--accent)" : "var(--border)"}` }}
            >
              {selected.has(s.id) && (
                <span className="text-white text-[10px] font-extrabold">
                  ✓
                </span>
              )}
            </div>
            <span
              className={`text-sm ${selected.has(s.id) ? "text-[var(--text)]" : "text-[var(--muted)]"}`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div>
        <div className="text-sm font-semibold text-[var(--text)] mb-4">
          Export Options
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] py-4 px-[18px] mb-4">
          <div className="text-xs text-[var(--muted)] mb-[10px]">
            Summary
          </div>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "Portfolio Value", value: fmt(data.netWorth) },
              { label: "XIRR", value: `${data.xirr.toFixed(1)}%` },
              { label: "Total Gain", value: fmt(data.totalGains) },
              { label: "Holdings", value: `${data.assets.length} stocks` },
              { label: "Sections", value: `${selected.size} selected` },
            ].map((r) => (
              <div
                key={r.label}
                className="flex justify-between text-xs"
              >
                <span className="text-[var(--muted)]">{r.label}</span>
                <span className="text-[var(--text)] font-[var(--font-mono)]">
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <button
            type="button"
          onClick={exportPDF}
          disabled={selected.size === 0}
          className={`w-full p-3 border-0 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 ${selected.size > 0 ? "bg-[var(--accent)] cursor-pointer" : "bg-[var(--border)] cursor-not-allowed"}`}
        >
          <Icon name="download" size={16} color="#fff" />
          Export PDF ({selected.size} sections)
        </button>
      </div>
    </div>
  );
}
