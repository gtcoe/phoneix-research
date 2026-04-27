"use client";
import { fmt, fmtPct } from "@/lib/formatters";

const CATEGORIES = ["All", "NSE Stocks", "US Stocks", "NPS", "FD", "Cash"];

interface Props {
  catTotals: Record<string, { invested: number; current: number }>;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

export default function SummaryCards({
  catTotals,
  activeCategory,
  onCategoryChange,
}: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 12,
        marginBottom: 20,
      }}
    >
      {CATEGORIES.slice(1).map((cat) => {
        const t = catTotals[cat] || { invested: 0, current: 0 };
        const gain = t.current - t.invested;
        const pct = t.invested > 0 ? (gain / t.invested) * 100 : 0;
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat === activeCategory ? "All" : cat)}
            style={{
              background:
                activeCategory === cat ? "var(--accent-dim)" : "var(--card)",
              border: `1px solid ${activeCategory === cat ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 10,
              padding: "12px 14px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div
              style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}
            >
              {cat}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {fmt(t.current)}
            </div>
            <div
              style={{
                fontSize: 12,
                color: gain >= 0 ? "var(--gain)" : "var(--loss)",
                fontFamily: "var(--font-mono)",
                marginTop: 2,
              }}
            >
              {gain >= 0 ? "+" : ""}
              {fmtPct(pct)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
