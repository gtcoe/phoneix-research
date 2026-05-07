"use client";
import { useState } from "react";
import { Icon } from "@/components/ui";
import type { PhoenixData } from "@/types";
import {
  STATUS_OPTIONS,
  STATUS_LABELS,
} from "@/constants/watchlist";
import type { WatchStatus } from "@/constants/watchlist";
import { WatchCard } from "./WatchCard";

type WatchItem = PhoenixData["watchlist"][number];

export default function Watchlist({ data }: { data: PhoenixData }) {
  const [items, setItems] = useState<WatchItem[]>(data.watchlist);
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = items.filter(
    (i) => statusFilter === "all" || i.status === statusFilter,
  );

  const updateStatus = (id: string, status: WatchStatus) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const saveThesis = (id: string, thesis: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, thesis } : i)));
  };

  return (
    <div className="p-6">
      {/* Filter bar */}
      <div className="flex gap-2 mb-5 items-center flex-wrap">
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`py-[5px] px-3.5 rounded-full text-xs font-medium cursor-pointer border border-[var(--border)] transition-all duration-150 ${
              statusFilter === s
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface)] text-[var(--muted)]"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABELS[s as WatchStatus]}
          </button>
        ))}
        <span className="ml-auto text-xs text-[var(--muted)] font-[var(--font-mono)]">
          {filtered.length} stocks
        </span>
      </div>

      {/* Cards grid */}
      <div
        className="grid gap-3.5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}
      >
        {filtered.map((item) => (
          <WatchCard
            key={item.id}
            item={item}
            onStatusChange={updateStatus}
            onRemove={removeItem}
            onThesisSave={saveThesis}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-[60px] text-center text-[var(--muted)]">
          <Icon name="watchlist" size={36} color="var(--border)" />
          <div className="mt-3 text-sm">
            No stocks in this filter
          </div>
        </div>
      )}
    </div>
  );
}
