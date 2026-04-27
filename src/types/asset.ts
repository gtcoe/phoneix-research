/**
 * Asset and holding types.
 * Mirrors GET /api/v1/assets response shape.
 */
import type { AssetCategory, Exchange, Recommendation } from "./common";

/** Input shape for raw asset data before XIRR/gain/tax are computed. */
export interface RawAssetInput {
  id: number;
  name: string;
  ticker: string | null;
  category: AssetCategory;
  exchange: Exchange;
  invested: number;
  current: number;
  qty: number | null;
  entryDate: string | null;
  sector: string;
  rec: Recommendation | null;
  conviction: number | null;
  cashflows: Array<{ amount: number; date: string }>;
  entryPrice: number | null;
  currentPrice: number | null;
  targetPrice: number | null;
  targetNote: string | null;
}

/**
 * A single cashflow entry for XIRR calculation.
 * Dates are strings ("Mon YYYY") as returned by the API;
 * the client parses them via pd() before passing to calcXIRR.
 */
export interface Cashflow {
  /** Negative = outflow (purchase), positive = inflow (dividend / exit) */
  amount: number;
  /** "Mon YYYY" format e.g. "Jan 2024" */
  date: string;
}

/**
 * A fully computed asset/holding as returned by the backend.
 * The backend performs XIRR, holding-day, and tax calculations server-side.
 */
export interface Asset {
  /** Unique numeric ID, stable across sessions */
  id: number;
  name: string;
  /** NSE/BSE/NASDAQ ticker symbol. Null for NPS, FD, Cash. */
  ticker: string | null;
  category: AssetCategory;
  exchange: Exchange;
  /** Total capital deployed (cost basis) in INR */
  invested: number;
  /** Current market value in INR */
  current: number;
  /** Number of shares / units. Null for NPS, FD, Cash. */
  qty: number | null;
  /** First purchase date "Mon YYYY". Null for Cash. */
  entryDate: string | null;
  sector: string;
  rec: Recommendation | null;
  /** Analyst conviction score 1–10. Null for non-researched assets. */
  conviction: number | null;
  /** XIRR return % (e.g. 18.4 means 18.4%). Null if not enough cashflows. */
  xirr: number | null;
  /** Average cost price per share. Null for NPS/FD/Cash. */
  entryPrice: number | null;
  /** Latest market price per share. Null for NPS/FD/Cash. */
  currentPrice: number | null;
  /** Analyst price target per share. Null if not set. */
  targetPrice: number | null;
  /** Brief rationale for the target. Null if targetPrice is null. */
  targetNote: string | null;
  /** Calendar days since first purchase. Null for Cash. */
  holdingDays: number | null;
  /** Holding period in fractional years. Null for Cash. */
  holdingYears: number | null;
  /**
   * true  → held > 1 year (LTCG tax applies)
   * false → held < 1 year (STCG tax applies)
   * null  → not applicable (NPS, FD, Cash)
   */
  isLTCG: boolean | null;
  /** Absolute gain/loss = current - invested */
  gain: number;
  /** Gain as percentage of invested */
  gainPct: number;
  /** Applicable tax rate (0.10 for LTCG, 0.15 for STCG, 0.30 for FD, 0 for NPS, null for Cash) */
  taxRate: number | null;
  /** Tax liability in INR after portfolio-wide LTCG Rs 1L exemption */
  taxAmt: number | null;
  /** gain - taxAmt */
  postTaxGain: number;
}

/** Per-stock drawdown statistics shown on the Analysis → Drawdown tab. */
export interface DrawdownEntry {
  ticker: string;
  name: string;
  /** Average cost price */
  entry: number;
  /** All-time high price since entry */
  ath: number;
  /** Current price */
  current: number;
  /** Max drawdown from ATH in % (negative) */
  maxDD: number;
  /** Current drawdown from ATH in % (negative) */
  curDD: number;
  /** % gain needed from current price to recover to ATH */
  recoveryNeeded: number;
}
