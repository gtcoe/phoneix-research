"use client";
import { useState } from "react";
import { Icon } from "@/components/ui";
import LogTransactionModal from "@/components/common/modals/LogTransactionModal";
import type { PhoenixData } from "@/lib/data";
import MonthlyDeploymentChart from "./MonthlyDeploymentChart";
import FilterBar from "./FilterBar";
import TransactionRow from "./TransactionRow";

export default function Journal({ data }: { data: PhoenixData }) {
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showLogTx, setShowLogTx] = useState(false);

  const allTypes = [
    "all",
    ...Array.from(new Set(data.transactions.map((t) => t.type))),
  ];
  const allCategories = [
    "all",
    ...Array.from(new Set(data.transactions.map((t) => t.category))),
  ];

  const filtered = data.transactions.filter((t) => {
    const typeOk = filterType === "all" || t.type === filterType;
    const catOk = filterCategory === "all" || t.category === filterCategory;
    const searchOk =
      !search ||
      t.asset.toLowerCase().includes(search.toLowerCase()) ||
      t.ticker?.toLowerCase().includes(search.toLowerCase()) ||
      t.notes?.toLowerCase().includes(search.toLowerCase());
    return typeOk && catOk && searchOk;
  });

  const monthlyMap: Record<string, number> = {};
  data.transactions
    .filter((t) => t.type === "buy")
    .forEach((t) => {
      const d = t.dateObj;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + t.amount;
    });
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12);
  const maxMonthly = Math.max(...monthlyData.map(([, v]) => v), 1);

  return (
    <div style={{ padding: 24 }}>
      <MonthlyDeploymentChart monthlyData={monthlyData} maxMonthly={maxMonthly} />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        filterType={filterType}
        onTypeChange={setFilterType}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        allTypes={allTypes}
        allCategories={allCategories}
        filteredCount={filtered.length}
        onAddClick={() => setShowLogTx(true)}
      />
      {showLogTx && (
        <LogTransactionModal
          assets={data.assets}
          onClose={() => setShowLogTx(false)}
        />
      )}
      <div style={{ position: "relative", paddingLeft: 24 }}>
        <div
          style={{
            position: "absolute",
            left: 8,
            top: 0,
            bottom: 0,
            width: 2,
            background: "var(--border)",
          }}
        />
        {filtered.map((t) => (
          <TransactionRow
            key={t.id}
            transaction={t}
            isExpanded={expanded === t.id}
            onToggle={() => setExpanded(expanded === t.id ? null : t.id)}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <div
          style={{ padding: 60, textAlign: "center", color: "var(--muted)" }}
        >
          <Icon name="note" size={36} color="var(--border)" />
          <div style={{ marginTop: 12, fontSize: 14 }}>
            No journal entries match your filter
          </div>
        </div>
      )}
    </div>
  );
}
