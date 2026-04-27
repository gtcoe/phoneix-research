/**
 * Portfolio-level summary and performance types.
 * Mirrors the computed summary returned alongside assets in GET /api/v1/portfolio.
 */
import type { Asset } from "./asset";

/** A single data point in a portfolio or benchmark performance chart. */
export interface PerformancePoint {
  /** Display label e.g. "Jan 26", "Apr 26" */
  date: string;
  /** Portfolio/index value in INR at this point */
  value: number;
}

/** The five sub-scores that make up the Portfolio Health Score. */
export interface HealthComponents {
  /** XIRR vs 25% benchmark: (xirr / 25) * 100, capped at 100 */
  xirrScore: number;
  /** Alpha vs Nifty 50: ((xirr - 12) / 10) * 100 */
  alphaScore: number;
  /** Avg conviction of researched holdings: (avgConviction / 10) * 100 */
  convScore: number;
  /** Diversification: (numEquityHoldings / 8) * 100 */
  diversScore: number;
  /** Drawdown health: 100 - abs(worstDD) * 2.5 */
  drawScore: number;
}

/**
 * Aggregated portfolio statistics — the top-level summary card data.
 * Returned alongside the assets array by GET /api/v1/portfolio.
 */
export interface PortfolioSummary {
  /** Total current market value across all holdings */
  netWorth: number;
  /** Total capital deployed (sum of invested across all holdings) */
  totalInvested: number;
  /** netWorth - totalInvested */
  totalGains: number;
  /** totalGains as % of totalInvested */
  totalGainsPct: number;
  /** Estimated total tax liability across all holdings */
  totalTax: number;
  /** totalGains - totalTax */
  postTaxGains: number;
  /** Portfolio XIRR % (money-weighted return) */
  xirr: number;
  /** CAGR % (time-weighted, approximated) */
  cagr: number;
  /** Excess return vs Nifty 50 in percentage points */
  alpha: number;
  /** Rupee change today */
  dayChange: number;
  /** % change today */
  dayChangePct: number;
  /** 18-month portfolio value history for the main chart */
  history: PerformancePoint[];
  /** 0–100 composite health score */
  healthScore: number;
  healthComponents: HealthComponents;
  /** Ticker labels for the correlation matrix */
  corrLabels: string[];
  /** n×n correlation matrix (same order as corrLabels) */
  corrMatrix: number[][];
  /** Full assets list with computed metrics */
  assets: Asset[];
}
