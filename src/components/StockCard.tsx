"use client";

import Link from "next/link";
import { Stock, Recommendation } from "@/types";

const recConfig: Record<
  Recommendation,
  { label: string; bgColor: string; textColor: string }
> = {
  buy: {
    label: "BUY",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  hold: {
    label: "HOLD",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  sell: {
    label: "SELL",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  watch: {
    label: "WATCH",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
};

interface StockCardProps {
  stock: Stock;
}

export default function StockCard({ stock }: StockCardProps) {
  const rec = recConfig[stock.recommendation];

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-md hover:-translate-y-1 duration-200"
    >
      <Link href={`/stocks/${stock.slug}`} className="block p-5">
        {/* Header row: name + badges */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="text-base font-semibold text-gray-900 leading-snug">
            {stock.name}
          </h2>
          <div className="flex items-center gap-1.5 shrink-0">
            {stock.convictionScore !== undefined && (
              <span
                className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-gray-900 text-white"
                title={`Conviction: ${stock.convictionScore}/10`}
              >
                {stock.convictionScore}
              </span>
            )}
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${rec.bgColor} ${rec.textColor}`}
            >
              {rec.label}
            </span>
          </div>
        </div>

        {/* Ticker + exchange */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-600">
            {stock.exchange}
          </span>
          <span className="text-xs font-medium text-gray-500">
            {stock.ticker}
          </span>
          {stock.mcap && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">{stock.mcap}</span>
            </>
          )}
        </div>

        {/* Sector */}
        <div className="mb-3">
          <span className="text-xs text-gray-500">{stock.sector}</span>
        </div>

        {/* Thesis */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
          {stock.thesis}
        </p>

        {/* Position details */}
        {(stock.entryPrice || stock.targetMultiple || stock.horizon) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {stock.entryPrice && (
              <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                Entry {stock.entryPrice}
              </span>
            )}
            {stock.targetMultiple && (
              <span className="rounded border border-green-100 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                Target {stock.targetMultiple}
              </span>
            )}
            {stock.horizon && (
              <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-500">
                {stock.horizon}
              </span>
            )}
          </div>
        )}

        {/* Footer: date */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Analyzed {stock.dateAnalyzed}
          </span>
          <span className="text-xs font-medium text-gray-400 group-hover:text-gray-700 transition-colors">
            Read analysis →
          </span>
        </div>
      </Link>
    </div>
  );
}
