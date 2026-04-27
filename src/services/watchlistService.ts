/**
 * Watchlist service — resolves watchlist entries.
 * Current impl: synchronous mock. Backend swap: replace body with fetch('/api/v1/watchlist').
 */
import { phoenixData } from "@/lib/data";
import type { WatchlistItem } from "@/types/watchlist";

export function getWatchlist(): WatchlistItem[] {
  // TODO: return (await fetch('/api/v1/watchlist')).json()
  return phoenixData.watchlist;
}
