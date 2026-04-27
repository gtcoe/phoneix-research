/**
 * Conviction alert types.
 * Mirrors GET /api/v1/alerts response shape.
 */

/** How urgent / critical the alert is. */
export type AlertSeverity = "high" | "medium" | "low";

/**
 * Category of the alert — what triggered it.
 * - thesis_risk: core thesis is under threat
 * - governance: promoter pledge, related-party transactions, etc.
 * - guidance_cut: management cut revenue/profit guidance
 * - margin_stagnant: margins not improving despite thesis assumption
 * - positive: a positive catalyst or thesis confirmation event
 */
export type AlertType =
  | "thesis_risk"
  | "governance"
  | "guidance_cut"
  | "margin_stagnant"
  | "positive";

/** A single conviction-related alert for a holding or watchlist item. */
export interface ConvictionAlert {
  id: string;
  ticker: string;
  name: string;
  severity: AlertSeverity;
  type: AlertType;
  /** Human-readable alert description */
  message: string;
  /** Display date "Mon DD YYYY" */
  date: string;
  /** Whether the user has read/dismissed this alert */
  read: boolean;
}
