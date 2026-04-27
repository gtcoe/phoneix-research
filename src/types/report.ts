/**
 * Research report types.
 * Mirrors GET /api/v1/reports response shape.
 */
import type { Recommendation } from "./common";

/** A single published research report. */
export interface Report {
  /** URL-safe slug used in /stocks/[slug] route */
  slug: string;
  /** Company name */
  name: string;
  /** Ticker symbol */
  ticker: string;
  /** Month & year published e.g. "April 2025" */
  date: string;
  sector: string;
  rec: Recommendation;
  /** Analyst conviction score 1–10 */
  conviction: number;
  /** Relative path to the HTML analysis file e.g. "analyses/skygold_analysis.html" */
  file: string;
}
