"use client";

import { Stock } from "@/types";

interface SectorBarProps {
  stocks: Stock[];
  activeSector: string | null;
  onSelect: (sector: string | null) => void;
}

export default function SectorBar({
  stocks,
  activeSector,
  onSelect,
}: SectorBarProps) {
  // Count stocks per primary sector label
  const sectorCounts = stocks.reduce<Record<string, number>>((acc, s) => {
    const label = s.sector.split("/")[0].trim();
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  const sectors = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-8">
      <span className="text-xs text-gray-400 shrink-0 mr-1">Sectors:</span>
      <button
          type="button"
        onClick={() => onSelect(null)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
          activeSector === null
            ? "bg-gray-900 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {sectors.map(([label, count]) => (
        <button
          key={label}
            type="button"
          onClick={() => onSelect(activeSector === label ? null : label)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
            activeSector === label
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {label}
          <span
            className={`ml-1.5 text-xs ${
              activeSector === label ? "opacity-70" : "opacity-60"
            }`}
          >
            {count}
          </span>
        </button>
      ))}
    </div>
  );
}
