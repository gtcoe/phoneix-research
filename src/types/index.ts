// Import for local use in Stock interface
import type { Recommendation } from "./common";

// ─── Re-exports (single import point for all Phoenix types) ──────────────────
export type { Recommendation, AssetCategory, Exchange, TransactionCategory } from "./common";
export type { Asset, Cashflow, DrawdownEntry } from "./asset";
export type { PerformancePoint, HealthComponents, PortfolioSummary } from "./portfolio";
export type { BenchmarkEntry, BenchmarkSet } from "./benchmark";
export type { Transaction, TransactionType } from "./transaction";
export type { WatchlistItem, WatchStatus } from "./watchlist";
export type { Report } from "./report";
export type { QuarterlyReviewEntry, ReviewResult, ConvictionDelta, ReviewAction } from "./review";
export type { ConvictionAlert, AlertSeverity, AlertType } from "./alert";
export type { Goal } from "./goal";
export type { PhoenixData } from "./app";

// ─── Legacy stock-page types (used by /stocks/[slug] route) ──────────────────
export interface Stock {
  slug: string;
  name: string;
  ticker: string;
  exchange: string;
  sector: string;
  dateAnalyzed: string;
  /** Uses "recommendation" field name (vs "rec" used in Asset/WatchlistItem) */
  recommendation: Recommendation;
  thesis: string;
  mcap?: string;
  entryPrice?: string;
  targetMultiple?: string;
  horizon?: string;
  /** Analyst conviction score 1–10 */
  convictionScore?: number;
}

