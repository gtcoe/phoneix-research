/**
 * Quarterly review types.
 * Mirrors GET /api/v1/reviews response shape.
 */

/** Whether the holding beat, met, or missed expectations that quarter. */
export type ReviewResult = "beat" | "inline" | "miss" | "pending";

/** Direction of conviction change after reviewing the quarter. */
export type ConvictionDelta = "up" | "same" | "down";

/** Recommended portfolio action coming out of the review. */
export type ReviewAction = "hold" | "add" | "trim" | "exit" | "watch";

/** One completed (or pending) quarterly review for a single holding. */
export interface QuarterlyReviewEntry {
  /** Foreign key to Asset.id */
  assetId: number;
  /** Display label e.g. "Q1 FY26", "Q4 FY26" */
  quarter: string;
  /** Is the original investment thesis still valid? */
  thesisIntact: boolean;
  result: ReviewResult;
  convictionDelta: ConvictionDelta;
  action: ReviewAction;
  /** Analyst notes for the quarter */
  notes: string;
  /** ISO date "YYYY-MM-DD" when review was completed */
  completedAt: string;
}
