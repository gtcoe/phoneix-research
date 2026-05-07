/**
 * Research report types.
 * Mirrors GET /api/v1/reports response shape.
 */
import type { Recommendation } from "./common";

/** Discriminates the kind of report shown in the Reports screen. */
export type ReportType = "stock" | "comparison" | "investor" | "portfolio-review";

/** A single published research report. */
export interface Report {
  /** URL-safe slug used in /stocks/[slug] route */
  slug: string;
  /** Company / report name */
  name: string;
  /**
   * Ticker symbol. Null for comparison, investor-portfolio, and
   * portfolio-review reports that cover multiple or no single stock.
   */
  ticker: string | null;
  /** Month & year published e.g. "April 2025" */
  date: string;
  sector: string;
  /** Null for non-stock reports (comparisons, investor portfolios, reviews). */
  rec: Recommendation | null;
  /** Analyst conviction score 1–10. Null for non-stock reports. */
  conviction: number | null;
  /** Relative path to the HTML analysis file e.g. "analyses/skygold_analysis.html" */
  file: string;
  /**
   * Report category. Defaults to "stock" when omitted.
   * - "stock"            — single-company deep dive
   * - "comparison"       — head-to-head between two companies
   * - "investor"         — analysis of an investor's portfolio (Kacholia, Kedia…)
   * - "portfolio-review" — Garvit's own portfolio review notes
   */
  type?: ReportType;
}
