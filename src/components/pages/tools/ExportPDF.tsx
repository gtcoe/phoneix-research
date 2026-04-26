// @ts-nocheck
"use client";
import { useState } from "react";
import { fmt, fmtPct } from "@/lib/formatters";
import { Icon } from "@/components/ui";
import type { PhoenixData } from "@/lib/data";

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
          Select Sections
        </div>
        {sections.map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              background: selected.has(s.id)
                ? "var(--accent-dim)"
                : "var(--surface)",
              border: `1px solid ${selected.has(s.id) ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 8,
              marginBottom: 8,
              cursor: "pointer",
            }}
            onClick={() => toggleSection(s.id)}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                background: selected.has(s.id)
                  ? "var(--accent)"
                  : "transparent",
                border: `2px solid ${selected.has(s.id) ? "var(--accent)" : "var(--border)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {selected.has(s.id) && (
                <span style={{ color: "#fff", fontSize: 10, fontWeight: 800 }}>
                  ✓
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: 13,
                color: selected.has(s.id) ? "var(--text)" : "var(--muted)",
              }}
            >
              {s.label}
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
          Export Options
        </div>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "16px 18px",
            marginBottom: 16,
          }}
        >
          <div
            style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}
          >
            Summary
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "Portfolio Value", value: fmt(data.netWorth) },
              { label: "XIRR", value: `${data.xirr.toFixed(1)}%` },
              { label: "Total Gain", value: fmt(data.totalGains) },
              { label: "Holdings", value: `${data.assets.length} stocks` },
              { label: "Sections", value: `${selected.size} selected` },
            ].map((r) => (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "var(--muted)" }}>{r.label}</span>
                <span
                  style={{
                    color: "var(--text)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={exportPDF}
          disabled={selected.size === 0}
          style={{
            width: "100%",
            padding: "12px",
            background: selected.size > 0 ? "var(--accent)" : "var(--border)",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            cursor: selected.size > 0 ? "pointer" : "not-allowed",
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Icon name="download" size={16} color="#fff" />
          Export PDF ({selected.size} sections)
        </button>
      </div>
    </div>
  );
}
