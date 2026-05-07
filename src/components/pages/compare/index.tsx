"use client";
import { useState } from "react";
import { TabBar } from "@/components/ui";
import type { PhoenixData } from "@/types";
import { ErrorBoundary } from "@/components/common/components/ErrorBoundary";
import { GrowthChart } from "./GrowthChart";
import { ExcessReturnsChart } from "./BenchmarkTable";
import { AlphaTable } from "./AlphaTable";

const TABS = [
  { id: "growth", label: "Cumulative Growth" },
  { id: "excess", label: "Monthly Excess Returns" },
  { id: "alpha", label: "Holding Alpha" },
];

export default function Compare({ data }: { data: PhoenixData }) {
  const [tab, setTab] = useState("growth");

  return (
    <div className="p-6">
      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          {
            label: "Portfolio XIRR",
            value: `${data.xirr.toFixed(1)}%`,
            color: "var(--accent)",
          },
          {
            label: "vs Nifty 50",
            value: `${data.benchmarks.nifty50.xirr.toFixed(1)}%`,
            sub: `α +${data.alpha.toFixed(1)}%`,
            color: "#6366f1",
          },
          {
            label: "vs Midcap 150",
            value: `${data.benchmarks.midcap150.xirr.toFixed(1)}%`,
            sub: `α +${(data.xirr - data.benchmarks.midcap150.xirr).toFixed(1)}%`,
            color: "#f59e0b",
          },
          {
            label: "vs FD",
            value: `${data.benchmarks.fd.xirr.toFixed(1)}%`,
            sub: `α +${(data.xirr - data.benchmarks.fd.xirr).toFixed(1)}%`,
            color: "#10b981",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-[var(--card)] border border-[var(--border)] rounded-[10px] py-3 px-4"
          >
            <div className="text-[11px] text-[var(--muted)] mb-1">
              {c.label}
            </div>
            <div
              className="text-xl font-bold font-[var(--font-mono)]"
              style={{ color: c.color }}
            >
              {c.value}
            </div>
            {c.sub && (
              <div className="text-xs text-[var(--gain)] mt-[3px]">
                {c.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {/* key=tab resets the ErrorBoundary on every tab switch so a broken chart doesn't affect siblings */}
      <ErrorBoundary key={tab} pageName={TABS.find((t) => t.id === tab)?.label}>
        {tab === "growth" && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-[18px] px-5">
            <div className="text-sm font-semibold text-[var(--text)] mb-4">
              Cumulative Growth (normalised to 100)
            </div>
            <GrowthChart data={data} />
          </div>
        )}

        {tab === "excess" && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-[18px] px-5">
            <div className="text-sm font-semibold text-[var(--text)] mb-4">
              Monthly Excess Returns vs Nifty 50
            </div>
            <ExcessReturnsChart data={data} />
            <div className="flex gap-4 mt-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-[10px] bg-[var(--gain)] rounded-[2px] opacity-80" />
                <span className="text-[11px] text-[var(--muted)]">
                  Outperformed
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-[10px] bg-[var(--loss)] rounded-[2px] opacity-80" />
                <span className="text-[11px] text-[var(--muted)]">
                  Underperformed
                </span>
              </div>
            </div>
          </div>
        )}

        {tab === "alpha" && <AlphaTable data={data} />}
      </ErrorBoundary>
    </div>
  );
}
