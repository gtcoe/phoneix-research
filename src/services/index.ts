/**
 * Services barrel — named exports for all domain services.
 *
 * Usage:
 *   import { getPhoenixData } from "@/services";
 *   import { getAssets } from "@/services/assetService"; // individual
 */
export { getPhoenixData } from "./dataService";
export { getAssets, getDrawdowns } from "./assetService";
export { getPortfolioSummary } from "./portfolioService";
export { getTransactions } from "./transactionService";
export { getWatchlist } from "./watchlistService";
export { getQuarterlyReviews } from "./reviewService";
export { getReports } from "./reportService";
export { getGoals } from "./goalService";
export { getAlerts } from "./alertService";
export { getBenchmarks } from "./benchmarkService";
