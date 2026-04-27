/**
 * UI display thresholds.
 * Controls when colours change (green/yellow/red) across the app.
 * Centralised so "good XIRR" or "high conviction" is not hardcoded in 12 places.
 */
export const THRESHOLDS = {
  // ── XIRR / Returns ─────────────────────────────────────────────────────────
  /** XIRR % above which a return is shown in green */
  GOOD_XIRR: 15,

  // ── Conviction ──────────────────────────────────────────────────────────────
  /** Conviction score (1–10) at or above which = high conviction (green dot) */
  HIGH_CONVICTION: 8,
  /** Conviction score (1–10) at or above which = medium conviction (yellow dot) */
  MEDIUM_CONVICTION: 6,

  // ── Portfolio Health Score ──────────────────────────────────────────────────
  /** Health score ≥ this = good (green) */
  GOOD_HEALTH_SCORE: 75,
  /** Health score ≥ this = fair (yellow) */
  FAIR_HEALTH_SCORE: 50,

  // ── Global Search result limits ─────────────────────────────────────────────
  SEARCH: {
    PORTFOLIO_RESULTS: 4,
    WATCHLIST_RESULTS: 3,
    REPORTS_RESULTS:   3,
  },
} as const;
