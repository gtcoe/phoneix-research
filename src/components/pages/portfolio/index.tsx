"use client";
import React, { useState } from "react";
import { Icon } from "@/components/ui";
import LogTransactionModal from "@/components/common/modals/LogTransactionModal";
import type { PhoenixData } from "@/lib/data";
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

  const filtered = data.assets.filter(
    (a) => category === "All" || a.category === category,
  );
  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey] as number | string;
    const bv = b[sortKey] as number | string;
    const cmp =
      typeof av === "string"
        ? (av as string).localeCompare(bv as string)
        : (av as number) - (bv as number);
    return sortAsc ? cmp : -cmp;
  });

  const catTotals = data.assets.reduce<
    Record<string, { invested: number; current: number }>
  >((acc, a) => {
    if (!acc[a.category]) acc[a.category] = { invested: 0, current: 0 };
    acc[a.category].invested += a.invested;
    acc[a.category].current += a.current;
    return acc;
  }, {});

  const thStyle = (k: SortKey): React.CSSProperties => ({
    padding: "8px 10px",
    fontSize: 11,
    color: sortKey === k ? "var(--accent)" : "var(--muted)",
    fontWeight: 500,
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    letterSpacing: ".04em",
  });

  return (
    <div style={{ padding: 24 }}>
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
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead style={{ background: "var(--surface)" }}>
            <tr>
              <th style={{ ...thStyle("name"), textAlign: "left", paddingLeft: 16 }} onClick={() => handleSort("name")}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  Company <SortIcon sortKey={sortKey} sortAsc={sortAsc} k="name" />
                </span>
              </th>
              <th style={{ ...thStyle("current"), textAlign: "right" }} onClick={() => handleSort("current")}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                  Value <SortIcon sortKey={sortKey} sortAsc={sortAsc} k="current" />
                </span>
              </th>
              <th style={{ ...thStyle("gainPct"), textAlign: "right" }} onClick={() => handleSort("gainPct")}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                  Gain <SortIcon sortKey={sortKey} sortAsc={sortAsc} k="gainPct" />
                </span>
              </th>
              <th style={{ ...thStyle("xirr"), textAlign: "right" }} onClick={() => handleSort("xirr")}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                  XIRR <SortIcon sortKey={sortKey} sortAsc={sortAsc} k="xirr" />
                </span>
              </th>
              <th style={{ padding: "8px 10px", fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>Rec</th>
              <th style={{ ...thStyle("conviction"), textAlign: "right" }} onClick={() => handleSort("conviction")}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                  Conv <SortIcon sortKey={sortKey} sortAsc={sortAsc} k="conviction" />
                </span>
              </th>
              <th style={{ ...thStyle("holdingDays"), textAlign: "right" }} onClick={() => handleSort("holdingDays")}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                  Holding <SortIcon sortKey={sortKey} sortAsc={sortAsc} k="holdingDays" />
                </span>
              </th>
              <th style={{ padding: "8px 10px", fontSize: 11, color: "var(--muted)", fontWeight: 500, textAlign: "right" }}>Target</th>
              <th style={{ padding: "8px 10px", fontSize: 11, color: "var(--muted)", fontWeight: 500, textAlign: "right", paddingRight: 16 }}>Trend</th>
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
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
            No holdings in this category
          </div>
        )}
      </div>
    </div>
  );
}
