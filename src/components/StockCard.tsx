"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="rounded-xl border border-gray-200 bg-white overflow-hidden"
    >
      <Link href={`/stocks/${stock.slug}`} className="block p-5">
        {/* Header row: name + rec badge */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="text-base font-semibold text-gray-900 leading-snug">
            {stock.name}
          </h2>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${rec.bgColor} ${rec.textColor}`}
          >
            {rec.label}
          </span>
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
    </motion.div>
  );
}
