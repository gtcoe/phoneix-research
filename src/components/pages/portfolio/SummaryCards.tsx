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
    <div className="grid grid-cols-5 gap-3 mb-5">
      {CATEGORIES.slice(1).map((cat) => {
        const t = catTotals[cat] || { invested: 0, current: 0 };
        const gain = t.current - t.invested;
        const pct = t.invested > 0 ? (gain / t.invested) * 100 : 0;
        return (
          <button
            type="button"
            key={cat}
            onClick={() => onCategoryChange(cat === activeCategory ? "All" : cat)}
            className={`${activeCategory === cat ? "bg-[var(--accent-dim)]" : "bg-[var(--card)]"} rounded-[10px] py-3 px-3.5 cursor-pointer text-left`}
            style={{ border: `1px solid ${activeCategory === cat ? "var(--accent)" : "var(--border)"}` }}
          >
            <div className="text-[11px] text-[var(--muted)] mb-1">
              {cat}
            </div>
            <div className="text-base font-bold text-[var(--text)] font-[var(--font-mono)]">
              {fmt(t.current)}
            </div>
            <div
              className="text-xs font-[var(--font-mono)] mt-0.5"
              style={{ color: gain >= 0 ? "var(--gain)" : "var(--loss)" }}
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
