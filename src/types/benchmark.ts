/**
 * Benchmark comparison types.
 * Mirrors the benchmarks object returned by GET /api/v1/portfolio.
 */
import type { PerformancePoint } from "./portfolio";

/** Performance data for a single benchmark index or instrument. */
export interface BenchmarkEntry {
  /** Display name e.g. "Nifty 50" */
  label: string;
  /** CSS color string used in charts */
  color: string;
  /** Benchmark XIRR % over the same holding period as the portfolio */
  xirr: number;
  /** Benchmark CAGR % */
  cagr: number;
  /** 18-month value history (same date range as portfolio history) */
  history: PerformancePoint[];
}

/** The three benchmark series compared against the portfolio. */
export interface BenchmarkSet {
  nifty50: BenchmarkEntry;
  midcap150: BenchmarkEntry;
  fd: BenchmarkEntry;
}
