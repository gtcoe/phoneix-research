"use client";

import { useState, useMemo } from "react";
import { Stock, Recommendation } from "@/types";
import StockCard from "./StockCard";
import SectorBar from "./SectorBar";

type SortOption = "newest" | "oldest" | "conviction";

const recPriority: Record<Recommendation, number> = {
  buy: 0,
  hold: 1,
  watch: 2,
  sell: 3,
};

const filterOptions: { label: string; value: "all" | Recommendation }[] = [
  { label: "All", value: "all" },
  { label: "Buy", value: "buy" },
  { label: "Hold", value: "hold" },
  { label: "Watch", value: "watch" },
  { label: "Sell", value: "sell" },
];

export default function StockGrid({ stocks }: { stocks: Stock[] }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | Recommendation>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [activeSector, setActiveSector] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...stocks];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.ticker.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q) ||
          s.thesis.toLowerCase().includes(q)
      );
    }

    if (activeFilter !== "all") {
      list = list.filter((s) => s.recommendation === activeFilter);
    }

    if (activeSector !== null) {
      list = list.filter((s) => s.sector.split("/")[0].trim() === activeSector);
    }

    if (sort === "conviction") {
      list.sort((a, b) => recPriority[a.recommendation] - recPriority[b.recommendation]);
    } else if (sort === "oldest") {
      list.sort((a, b) => a.dateAnalyzed.localeCompare(b.dateAnalyzed));
    } else {
      list.reverse();
    }

    return list;
  }, [stocks, search, activeFilter, sort]);

  const buys = filtered.filter((s) => s.recommendation === "buy");
  const others = filtered.filter((s) => s.recommendation !== "buy");
  const showSplit =
    activeFilter === "all" &&
    activeSector === null &&
    !search.trim() &&
    buys.length > 0 &&
    others.length > 0;

  return (
    <div>
      {/* Search + Sort row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, ticker, sector…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 shrink-0">Sort:</span>
          {(["newest", "oldest", "conviction"] as SortOption[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setSort(opt)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors cursor-pointer ${
                sort === opt
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

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

      {/* Sector filter */}
      <SectorBar
        stocks={stocks}
        activeSector={activeSector}
        onSelect={setActiveSector}
      />

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400 text-sm">
          No stocks match your search.
        </div>
      ) : showSplit ? (
        <>
          {/* High Conviction */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-green-700">
                High Conviction
              </span>
              <span className="h-px flex-1 bg-green-100" />
              <span className="text-xs text-green-600 font-medium">
                {buys.length} {buys.length === 1 ? "idea" : "ideas"}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {buys.map((stock) => (
                <StockCard key={stock.slug} stock={stock} />
              ))}
            </div>
          </div>

          {/* On Radar */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                On Radar
              </span>
              <span className="h-px flex-1 bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">
                {others.length} {others.length === 1 ? "idea" : "ideas"}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((stock) => (
                <StockCard key={stock.slug} stock={stock} />
              ))}
            </div>
          </div>
        </>
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
