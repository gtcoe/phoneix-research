/**
 * Portfolio service — resolves portfolio-level summary statistics.
 * Current impl: synchronous mock. Backend swap: replace body with fetch('/api/v1/portfolio').
 */
import { phoenixData } from "@/lib/data";
import type { PortfolioSummary } from "@/types/portfolio";

export function getPortfolioSummary(): PortfolioSummary {
  // TODO: return (await fetch('/api/v1/portfolio')).json()
  const { benchmarks, reports, drawdowns, watchlist, transactions, goals, quarterlyReviews, convictionAlerts, ...summary } = phoenixData;
  return summary;
}
