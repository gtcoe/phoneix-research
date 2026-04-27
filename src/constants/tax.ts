/**
 * Indian capital gains tax constants (FY 2024-25 and onwards post-Budget 2024).
 *
 * Sources:
 * - STCG on equity / equity MF: 20% (raised from 15% in Budget 2024, effective 23 Jul 2024)
 *   NOTE: Using 15% here as a conservative estimate for holdings pre-Jul 2024;
 *   update to 0.20 once all holdings are post-Jul 2024.
 * - LTCG on equity: 12.5% (raised from 10%, effective 23 Jul 2024). Using 10% as
 *   conservative blended rate for older holdings.
 * - FD / debt interest: taxed at slab rate; using 30% as top-bracket estimate.
 * - NPS: partial-withdrawal exempt; annuity portion taxed as income — simplified to 0%.
 * - LTCG exemption: ₹1L per FY (unchanged).
 * - LTCG qualifying period for equity: 12 months (365 days).
 */
export const TAX = {
  /** Long-term capital gains rate for equity (blended/conservative) */
  LTCG_RATE: 0.10,
  /** Short-term capital gains rate for equity (blended/conservative) */
  STCG_RATE: 0.15,
  /** Fixed deposit interest taxed at top income-tax slab */
  FD_RATE: 0.30,
  /** NPS gains are effectively tax-exempt at this simplified level */
  NPS_RATE: 0,
  /** Annual LTCG exemption threshold in INR */
  LTCG_EXEMPTION: 100_000,
  /** Minimum holding period in calendar days to qualify for LTCG treatment */
  LTCG_HOLDING_DAYS: 365,
} as const;
