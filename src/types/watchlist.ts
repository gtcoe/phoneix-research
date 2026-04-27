/**
 * Watchlist types.
 * Mirrors GET /api/v1/watchlist response shape.
 */
import type { Recommendation } from "./common";

/** Raw watchlist input shape (without server-computed `sinceAddedPct`). */
export type RawWatchlistInput = Omit<WatchlistItem, "sinceAddedPct">;

/** Lifecycle status of a watchlist item. Stored as VARCHAR(20) in DB. */
export type WatchStatus = "watching" | "interested" | "passed";

/**
 * A single watchlist entry as returned by the API.
 * `sinceAddedPct` is computed server-side from (currentPrice - priceAtAdd) / priceAtAdd.
 */
export interface WatchlistItem {
  id: string;
  ticker: string;
  name: string;
  /** Exchange the stock trades on */
  exchange: string;
  sector: string;
  rec: Recommendation | null;
  /** Analyst conviction score 1–10. Null if not yet researched. */
  conviction: number | null;
  /** Market cap display string e.g. "₹584 Cr" */
  mcap: string;
  /** Price at which to send an alert. Null if not set. */
  alertPrice: number | null;
  /** Latest market price */
  currentPrice: number;
  /** Market price at the time this item was added to the watchlist */
  priceAtAdd: number;
  /** ISO date "YYYY-MM-DD" when added */
  addedDate: string;
  /** Investment thesis notes */
  thesis: string;
  status: WatchStatus;
  /** Relative path to the HTML analysis report. Null if no report written yet. */
  reportFile: string | null;
  /** % price change since addedDate. Computed server-side. */
  sinceAddedPct: number;
}
