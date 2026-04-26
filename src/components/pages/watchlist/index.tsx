// @ts-nocheck
"use client";
import { useState } from "react";
import { Icon } from "@/components/ui";
import type { PhoenixData } from "@/lib/data";
import { WatchCard } from "./WatchCard";

type WatchItem = PhoenixData["watchlist"][number];

const STATUS_OPTIONS = ["watching", "interested", "passed"] as const;
type WatchStatus = (typeof STATUS_OPTIONS)[number];
const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: "Watching",
  interested: "Interested",
  passed: "Passed",
};

export default function Watchlist({ data }: { data: PhoenixData }) {
  const [items, setItems] = useState<WatchItem[]>(data.watchlist);
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = items.filter(
    (i) => statusFilter === "all" || i.status === statusFilter,
  );

  const updateStatus = (id: string, status: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const saveThesis = (id: string, thesis: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, thesis } : i)));
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "5px 14px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              border: "1px solid var(--border)",
              background:
                statusFilter === s ? "var(--accent)" : "var(--surface)",
              color: statusFilter === s ? "#fff" : "var(--muted)",
              transition: "all .15s",
            }}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 12,
            color: "var(--muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {filtered.length} stocks
        </span>
      </div>

      {/* Cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 14,
        }}
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
        <div
          style={{ padding: 60, textAlign: "center", color: "var(--muted)" }}
        >
          <Icon name="watchlist" size={36} color="var(--border)" />
          <div style={{ marginTop: 12, fontSize: 14 }}>
            No stocks in this filter
          </div>
        </div>
      )}
    </div>
  );
}
