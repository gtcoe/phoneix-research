/**
 * Review service — resolves quarterly review records.
 * Current impl: synchronous mock. Backend swap: replace body with fetch('/api/v1/reviews').
 */
import { phoenixData } from "@/lib/data";
import type { QuarterlyReviewEntry } from "@/types/review";

export function getQuarterlyReviews(): QuarterlyReviewEntry[] {
  // TODO: return (await fetch('/api/v1/reviews')).json()
  return phoenixData.quarterlyReviews;
}
