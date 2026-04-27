/**
 * Data service — assembles the full PhoenixData object that every page component receives.
 *
 * This is the single choke-point between the data layer and the UI.
 * When the backend is ready, replace each service call with a real fetch():
 *   const [summary, transactions, watchlist, ...] = await Promise.all([...])
 *
 * Usage:
 *   import { getPhoenixData } from "@/services/dataService";
 *   const data = getPhoenixData();
 */
import { getPortfolioSummary } from "./portfolioService";
import { getTransactions } from "./transactionService";
import { getWatchlist } from "./watchlistService";
import { getReports } from "./reportService";
import { getGoals } from "./goalService";
import { getAlerts } from "./alertService";
import { getBenchmarks } from "./benchmarkService";
import { getDrawdowns } from "./assetService";
import { getQuarterlyReviews } from "./reviewService";
import type { PhoenixData } from "@/types";

export function getPhoenixData(): PhoenixData {
  return {
    ...getPortfolioSummary(),
    benchmarks: getBenchmarks(),
    reports: getReports(),
    drawdowns: getDrawdowns(),
    watchlist: getWatchlist(),
    transactions: getTransactions(),
    goals: getGoals(),
    quarterlyReviews: getQuarterlyReviews(),
    convictionAlerts: getAlerts(),
  };
}
