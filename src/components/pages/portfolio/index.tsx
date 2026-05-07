"use client";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import LogTransactionModal from "@/components/common/modals/LogTransactionModal";
import type { PhoenixData } from "@/types";
import SummaryCards from "./SummaryCards";
import FilterBar from "./FilterBar";
import HoldingRow from "./HoldingRow";

type Asset = PhoenixData["assets"][number];
type SortKey =
  | "name"
  | "current"
  | "gainPct"
  | "xirr"
  | "conviction"
  | "holdingDays";

const CATEGORIES = ["All", "NSE Stocks", "US Stocks", "NPS", "FD", "Cash"];

function SortIcon({ sortKey, k, sortAsc }: { sortKey: SortKey; k: SortKey; sortAsc: boolean }) {
  return sortKey === k ? (
    <Icon name={sortAsc ? "arrowUp" : "arrowDown"} size={12} color="var(--accent)" />
  ) : (
    <Icon name="arrowDown" size={12} color="var(--border)" />
  );
}

export default function Portfolio({ data }: { data: PhoenixData }) {
  const [sortKey, setSortKey] = useState<SortKey>("current");
  const [sortAsc, setSortAsc] = useState(false);
  const [category, setCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showLogTx, setShowLogTx] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  const filtered = useMemo(
    () => data.assets.filter((a) => category === "All" || a.category === category),
    [data.assets, category],
  );
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      const cmp =
        typeof av === "string"
          ? (av as string).localeCompare(bv as string)
          : (av as number) - (bv as number);
      return sortAsc ? cmp : -cmp;
    }),
    [filtered, sortKey, sortAsc],
  );

  const catTotals = useMemo(
    () => data.assets.reduce<Record<string, { invested: number; current: number }>>(
      (acc, a) => {
        if (!acc[a.category]) acc[a.category] = { invested: 0, current: 0 };
        acc[a.category].invested += a.invested;
        acc[a.category].current += a.current;
        return acc;
      },
      {},
    ),
    [data.assets],
  );

  const thBase = "py-2 px-[10px] text-[11px] font-medium cursor-pointer select-none whitespace-nowrap tracking-[.04em]";
  const thColor = (k: SortKey) => sortKey === k ? "var(--accent)" : "var(--muted)";

  return (
    <div className="p-6">
      <SummaryCards
        catTotals={catTotals}
        activeCategory={category}
        onCategoryChange={setCategory}
      />
      <FilterBar
        category={category}
        onCategoryChange={setCategory}
        holdingsCount={sorted.length}
        onAddClick={() => setShowLogTx(true)}
      />
      {showLogTx && (
        <LogTransactionModal
          assets={data.assets}
          onClose={() => setShowLogTx(false)}
        />
      )}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[var(--surface)]">
            <tr>
              <th className={`${thBase} text-left pl-4`} style={{ color: thColor("name") }} onClick={() => handleSort("name")}>
                <span className="flex items-center gap-1">
                  Company <SortIcon sortKey={sortKey} sortAsc={sortAsc} k="name" />
                </span>
              </th>
              <th className={`${thBase} text-right`} style={{ color: thColor("current") }} onClick={() => handleSort("current")}>
                <span className="flex items-center justify-end gap-1">
                  Value <SortIcon sortKey={sortKey} sortAsc={sortAsc} k="current" />
                </span>
              </th>
              <th className={`${thBase} text-right`} style={{ color: thColor("gainPct") }} onClick={() => handleSort("gainPct")}>
                <span className="flex items-center justify-end gap-1">
                  Gain <SortIcon sortKey={sortKey} sortAsc={sortAsc} k="gainPct" />
                </span>
              </th>
              <th className={`${thBase} text-right`} style={{ color: thColor("xirr") }} onClick={() => handleSort("xirr")}>
                <span className="flex items-center justify-end gap-1">
                  XIRR <SortIcon sortKey={sortKey} sortAsc={sortAsc} k="xirr" />
                </span>
              </th>
              <th className="py-2 px-[10px] text-[11px] text-[var(--muted)] font-medium">Rec</th>
              <th className={`${thBase} text-right`} style={{ color: thColor("conviction") }} onClick={() => handleSort("conviction")}>
                <span className="flex items-center justify-end gap-1">
                  Conv <SortIcon sortKey={sortKey} sortAsc={sortAsc} k="conviction" />
                </span>
              </th>
              <th className={`${thBase} text-right`} style={{ color: thColor("holdingDays") }} onClick={() => handleSort("holdingDays")}>
                <span className="flex items-center justify-end gap-1">
                  Holding <SortIcon sortKey={sortKey} sortAsc={sortAsc} k="holdingDays" />
                </span>
              </th>
              <th className="py-2 px-[10px] text-[11px] text-[var(--muted)] font-medium text-right">Target</th>
              <th className="py-2 px-[10px] text-[11px] text-[var(--muted)] font-medium text-right pr-4">Trend</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => (
              <HoldingRow
                key={a.id}
                asset={a}
                expanded={expandedId === a.id}
                onToggle={() => setExpandedId(expandedId === a.id ? null : a.id)}
              />
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="p-10 text-center text-[var(--muted)] text-sm">
            No holdings in this category
          </div>
        )}
      </div>
    </div>
  );
}
