/**
 * Portfolio Health Score constants.
 * All scoring formulas and weights are here — change a benchmark by editing one value.
 *
 * Formula (score 0–100):
 *   healthScore = Σ(componentScore × weight)
 *
 * Component formulas:
 *   xirrScore  = min(100, (xirr / XIRR_TARGET) * 100)
 *   alphaScore = min(100, max(0, ((xirr - ALPHA_BENCHMARK) / ALPHA_RANGE) * 100))
 *   convScore  = (avgConviction / MAX_CONVICTION) * 100
 *   diversScore= min(100, (numEquityHoldings / IDEAL_HOLDINGS) * 100)
 *   drawScore  = max(0, 100 - abs(worstDrawdownPct) * DRAWDOWN_PENALTY)
 */
export const HEALTH_SCORE = {
  /** XIRR at which xirr component score = 100 */
  XIRR_TARGET: 25,
  /** Baseline CAGR used to compute alpha (Nifty 50 long-run average) */
  ALPHA_BENCHMARK: 12,
  /** Range above ALPHA_BENCHMARK that maps to 100% alpha score */
  ALPHA_RANGE: 10,
  /** Max conviction score used in ConvictionDot and avg computation */
  MAX_CONVICTION: 10,
  /** Number of equity holdings that achieves full diversification score */
  IDEAL_HOLDINGS: 8,
  /** Multiplier applied to worst drawdown % to penalise drawdown score */
  DRAWDOWN_PENALTY: 2.5,

  /** Component weights — must sum to 1.0 */
  WEIGHTS: {
    XIRR:           0.30,
    ALPHA:          0.25,
    CONVICTION:     0.20,
    DIVERSIFICATION:0.15,
    DRAWDOWN:       0.10,
  },
} as const;
