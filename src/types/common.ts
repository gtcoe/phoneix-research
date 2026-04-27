/**
 * Shared string-literal types used across multiple domains.
 * These match the exact values stored in the database and returned by the API.
 */

/** Analyst recommendation on an asset or watchlist item. */
export type Recommendation = "buy" | "hold" | "watch" | "sell";

/** Asset class / portfolio category. Matches DB enum. */
export type AssetCategory =
  | "NSE Stocks"
  | "US Stocks"
  | "NPS"
  | "FD"
  | "Cash";

/** Stock exchange identifier. Null for non-traded assets (NPS, FD, Cash). */
export type Exchange = "NSE" | "BSE" | "NASDAQ" | "NYSE" | null;

/** Category of a logged transaction — mirrors AssetCategory for grouping. */
export type TransactionCategory = AssetCategory;
