import { Stock, Recommendation } from "@/types";

interface PortfolioInsightsProps {
  stocks: Stock[];
}

const recConfig: Record<Recommendation, { label: string; color: string; bar: string }> = {
  buy:   { label: "Buy",   color: "text-green-700",  bar: "bg-green-500" },
  hold:  { label: "Hold",  color: "text-yellow-700", bar: "bg-yellow-400" },
  watch: { label: "Watch", color: "text-blue-700",   bar: "bg-blue-400" },
  sell:  { label: "Sell",  color: "text-red-700",    bar: "bg-red-400" },
};

export default function PortfolioInsights({ stocks }: PortfolioInsightsProps) {
  const counts = stocks.reduce<Partial<Record<Recommendation, number>>>(
    (acc, s) => {
      acc[s.recommendation] = (acc[s.recommendation] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const avgConviction =
    stocks.filter((s) => s.convictionScore !== undefined).length > 0
      ? (
          stocks
            .filter((s) => s.convictionScore !== undefined)
            .reduce((sum, s) => sum + (s.convictionScore ?? 0), 0) /
          stocks.filter((s) => s.convictionScore !== undefined).length
        ).toFixed(1)
      : null;

  const recOrder: Recommendation[] = ["buy", "hold", "watch", "sell"];

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 mb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Conviction bar */}
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-xs text-gray-400 mb-1">Conviction breakdown</p>
          <div className="flex items-center gap-3">
            {/* Segmented bar */}
            <div className="flex h-2.5 flex-1 rounded-full overflow-hidden gap-px bg-gray-100">
              {recOrder.map((rec) => {
                const count = counts[rec] ?? 0;
                const pct = stocks.length ? (count / stocks.length) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={rec}
                    className={`${recConfig[rec].bar} h-full`}
                    style={{ width: `${pct}%` }}
                    title={`${recConfig[rec].label}: ${count}`}
                  />
                );
              })}
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {recOrder.map((rec) => {
              const count = counts[rec] ?? 0;
              if (!count) return null;
              return (
                <span key={rec} className={`text-xs font-medium ${recConfig[rec].color}`}>
                  {count} {recConfig[rec].label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-12 bg-gray-100" />

        {/* Avg conviction score */}
        {avgConviction && (
          <div className="text-center sm:px-6">
            <p className="text-xs text-gray-400 mb-1">Avg conviction score</p>
            <p className="text-2xl font-semibold text-gray-900 tabular-nums">
              {avgConviction}
              <span className="text-sm text-gray-400 font-normal">/10</span>
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="hidden sm:block w-px h-12 bg-gray-100" />

        {/* Total coverage */}
        <div className="text-center sm:px-4">
          <p className="text-xs text-gray-400 mb-1">Total coverage</p>
          <p className="text-2xl font-semibold text-gray-900 tabular-nums">
            {stocks.length}
            <span className="text-sm text-gray-400 font-normal"> stocks</span>
          </p>
        </div>
      </div>
    </div>
  );
}
