/**
 * Root application data contract.
 *
 * PhoenixData is the single object passed to every page component.
 * In production it will be assembled from multiple API responses;
 * for now it is built from mock data in src/lib/data.ts.
 *
 * IMPORTANT: this is a proper interface — NOT derived from `typeof phoenixData`.
 * That pattern breaks when API response types differ from mock data shapes.
 */
import type { PortfolioSummary } from "./portfolio";
import type { BenchmarkSet } from "./benchmark";
import type { Transaction } from "./transaction";
import type { WatchlistItem } from "./watchlist";
import type { Report } from "./report";
import type { QuarterlyReviewEntry } from "./review";
import type { ConvictionAlert } from "./alert";
import type { Goal } from "./goal";
import type { DrawdownEntry } from "./asset";

/** The complete data object passed as props to every Phoenix page component. */
export interface PhoenixData extends PortfolioSummary {
  /** Benchmark comparison data for the Compare page */
  benchmarks: BenchmarkSet;
  /** Published research reports */
  reports: Report[];
  /** Per-stock drawdown data for the Analysis → Drawdown tab */
  drawdowns: DrawdownEntry[];
  /** Watchlist entries */
  watchlist: WatchlistItem[];
  /** Chronological transaction log (newest first, with dateObj computed) */
  transactions: Transaction[];
  /** Financial goals for the Goal Planning tool */
  goals: Goal[];
  /** Completed quarterly reviews indexed by (assetId, quarter) */
  quarterlyReviews: QuarterlyReviewEntry[];
  /** Conviction-related alerts for the TopBar bell and Dashboard */
  convictionAlerts: ConvictionAlert[];
}
