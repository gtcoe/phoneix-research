"use client";
import { useState } from "react";
import { Icon } from "@/components/ui";
import LogTransactionModal from "@/components/common/modals/LogTransactionModal";
import type { PhoenixData } from "@/types";
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
    <div className="p-6">
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
      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-[var(--border)]" />
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
        <div className="p-[60px] text-center text-[var(--muted)]">
          <Icon name="note" size={36} color="var(--border)" />
          <div className="mt-3 text-sm">
            No journal entries match your filter
          </div>
        </div>
      )}
    </div>
  );
}
