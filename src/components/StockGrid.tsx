"use client";

import { useState, useMemo } from "react";
import { Stock, Recommendation } from "@/types";
import StockCard from "./StockCard";

const filterOptions: { label: string; value: "all" | Recommendation }[] = [
  { label: "All", value: "all" },
  { label: "Buy", value: "buy" },
  { label: "Hold", value: "hold" },
  { label: "Watch", value: "watch" },
  { label: "Sell", value: "sell" },
];

interface StockGridProps {
  stocks: Stock[];
}

export default function StockGrid({ stocks }: StockGridProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | Recommendation>(
    "all"
  );

  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? stocks
        : stocks.filter((s) => s.recommendation === activeFilter),
    [stocks, activeFilter]
  );

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filterOptions.map((opt) => {
          const count =
            opt.value === "all"
              ? stocks.length
              : stocks.filter((s) => s.recommendation === opt.value).length;
          if (count === 0 && opt.value !== "all") return null;
          return (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                activeFilter === opt.value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
              <span
                className={`ml-1.5 text-xs ${
                  activeFilter === opt.value ? "opacity-70" : "opacity-60"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400 text-sm">
          No stocks in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((stock) => (
            <StockCard key={stock.slug} stock={stock} />
          ))}
        </div>
      )}
    </div>
  );
}
