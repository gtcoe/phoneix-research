import { Stock } from "@/types";

interface StatsStripProps {
  stocks: Stock[];
}

export default function StatsStrip({ stocks }: StatsStripProps) {
  const buys = stocks.filter((s) => s.recommendation === "buy").length;
  const sectors = new Set(
    stocks.map((s) => s.sector.split("/")[0].trim())
  ).size;
  const lastUpdated = [...stocks].reverse().find((s) => s.dateAnalyzed)
    ?.dateAnalyzed ?? "—";

  const stats = [
    { label: "Stocks Researched", value: String(stocks.length) },
    { label: "High Conviction Buys", value: String(buys) },
    { label: "Sectors Covered", value: String(sectors) },
    { label: "Last Updated", value: lastUpdated },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-10">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-gray-200 bg-white px-5 py-4"
        >
          <p className="text-xs text-gray-400 mb-1">{s.label}</p>
          <p className="text-2xl font-semibold text-gray-900 tabular-nums">
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
