// Phoenix Research — Data Layer (ported from src/designs/data.js)
// All dates are hardcoded relative to TODAY = April 22, 2026

export { calcXIRR } from "./xirr";
export { pd } from "./date";
// Re-export for backward compatibility (existing imports from "@/lib/data" still work)
export type { PhoenixData } from "@/types/app";
export type { QuarterlyReviewEntry } from "@/types/review";

import { calcXIRR } from "./xirr";
import { pd, pdFull, TODAY } from "./date";
import type { PhoenixData } from "@/types/app";
import { TAX } from "@/constants/tax";
import { HEALTH_SCORE } from "@/constants/health";

import { rawAssets } from "@/mocks/assets";
import { rawTransactionsData } from "@/mocks/transactions";
import { rawWatchlistData } from "@/mocks/watchlist";
import { reportsData } from "@/mocks/reports";
import { convictionAlertsData } from "@/mocks/alerts";
import { quarterlyReviewsData } from "@/mocks/reviews";
import { corrLabels, corrMatrix } from "@/mocks/correlation";
import { drawdownsData } from "@/mocks/drawdowns";
import { benchmarksData } from "@/mocks/benchmarks";
import { histStart, histDates, histBumps } from "@/mocks/history";
import { buildGoals } from "@/mocks/goals";

// ─── Per-Asset Computation (XIRR, gain, holding period, tax) ─────────────────
const rawComputed = rawAssets.map((a) => {
  let xirr: number | null = null;
  if (a.cashflows.length > 0) {
    const cfs = a.cashflows.map((cf) => ({
      amount: cf.amount,
      date: pd(cf.date)!,
    }));
    cfs.push({ amount: a.current, date: TODAY });
    cfs.sort((x, y) => x.date.getTime() - y.date.getTime());
    try {
      xirr = calcXIRR(cfs);
    } catch {
      /* ignore */
    }
  }
  const entryD = pd(a.entryDate);
  const holdingDays = entryD
    ? Math.floor((TODAY.getTime() - entryD.getTime()) / (1000 * 3600 * 24))
    : null;
  const holdingYears = holdingDays ? holdingDays / 365.25 : null;
  const isLTCG = holdingDays != null ? holdingDays >= TAX.LTCG_HOLDING_DAYS : null;
  const gain = a.current - a.invested;
  let taxRate: number | null = null;
  let taxAmt: number | null = null;
  if (a.category === "NSE Stocks" || a.category === "US Stocks") {
    taxRate = isLTCG ? TAX.LTCG_RATE : TAX.STCG_RATE;
    taxAmt = Math.max(0, gain) * taxRate!;
  } else if (a.category === "FD") {
    taxRate = TAX.FD_RATE;
    taxAmt = Math.max(0, gain) * taxRate;
  } else if (a.category === "NPS") {
    taxRate = TAX.NPS_RATE;
    taxAmt = 0;
  }
  return {
    id: a.id,
    name: a.name,
    ticker: a.ticker,
    category: a.category,
    exchange: a.exchange,
    invested: a.invested,
    current: a.current,
    qty: a.qty ?? null,
    entryDate: a.entryDate ?? null,
    sector: a.sector,
    rec: a.rec ?? null,
    conviction: a.conviction ?? null,
    xirr,
    entryPrice: a.entryPrice ?? null,
    currentPrice: a.currentPrice ?? null,
    targetPrice: a.targetPrice ?? null,
    targetNote: a.targetNote ?? null,
    holdingDays,
    holdingYears,
    isLTCG,
    gain,
    gainPct: a.invested > 0 ? (gain / a.invested) * 100 : 0,
    taxRate,
    taxAmt,
    postTaxGain: gain - (taxAmt ?? 0),
  };
});

// Apply portfolio-wide LTCG exemption (₹1L applies once, not per-holding)
const totalLtcgRaw = rawComputed
  .filter((a) => a.isLTCG === true)
  .reduce((s, a) => s + Math.max(0, a.gain), 0);
const totalLtcgTax =
  Math.max(0, totalLtcgRaw - TAX.LTCG_EXEMPTION) * TAX.LTCG_RATE;
const assets = rawComputed.map((a) => {
  if (
    a.isLTCG === true &&
    (a.category === "NSE Stocks" || a.category === "US Stocks") &&
    totalLtcgRaw > 0
  ) {
    const correctedTaxAmt =
      (Math.max(0, a.gain) / totalLtcgRaw) * totalLtcgTax;
    return {
      ...a,
      taxAmt: correctedTaxAmt,
      postTaxGain: a.gain - correctedTaxAmt,
    };
  }
  return a;
});

// ─── Portfolio-Level Metrics ──────────────────────────────────────────────────
const netWorth = assets.reduce((s, a) => s + a.current, 0);

const allCFs: Array<{ amount: number; date: Date }> = [];
rawAssets.forEach((a) => {
  a.cashflows.forEach((cf) => {
    allCFs.push({ amount: cf.amount, date: pd(cf.date)! });
  });
});
allCFs.push({ amount: netWorth, date: TODAY });
allCFs.sort((a, b) => a.date.getTime() - b.date.getTime());

let portfolioXIRR = 18.4;
try {
  portfolioXIRR = calcXIRR(allCFs) ?? 18.4;
} catch {
  /* ignore */
}

const totalInvested = assets.reduce((s, a) => s + a.invested, 0);
const totalGains = netWorth - totalInvested;
const totalTax = assets.reduce((s, a) => s + (a.taxAmt ?? 0), 0);
const cagr =
  Math.round((Math.pow(netWorth / histStart, 12 / 18) - 1) * 1000) / 10;

// ─── Performance History (depends on netWorth) ────────────────────────────────
const history = histDates.map((date, idx) => {
  const t = idx / 17;
  return {
    date,
    value: Math.round(
      histStart +
        (netWorth - histStart) * Math.pow(t, 0.8) +
        histBumps[idx] * histStart,
    ),
  };
});

// ─── Derived Collections ──────────────────────────────────────────────────────
const transactions = rawTransactionsData
  .map((t) => ({ ...t, dateObj: pdFull(t.date) as Date }))
  .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

const watchlist = rawWatchlistData.map((w) => ({
  ...w,
  sinceAddedPct:
    w.priceAtAdd > 0
      ? Math.round(
          ((w.currentPrice - w.priceAtAdd) / w.priceAtAdd) * 1000,
        ) / 10
      : 0,
}));

const goals = buildGoals(netWorth);

// ─── Portfolio Health Score ───────────────────────────────────────────────────
const equityAssets = assets.filter((a) => a.rec);
const avgConviction =
  equityAssets.reduce((s, a) => s + (a.conviction ?? 0), 0) /
  (equityAssets.length || 1);
const xirrScore = Math.min(
  100,
  (portfolioXIRR / HEALTH_SCORE.XIRR_TARGET) * 100,
);
const alphaScore = Math.min(
  100,
  Math.max(
    0,
    ((portfolioXIRR - HEALTH_SCORE.ALPHA_BENCHMARK) /
      HEALTH_SCORE.ALPHA_RANGE) *
      100,
  ),
);
const convScore = (avgConviction / HEALTH_SCORE.MAX_CONVICTION) * 100;
const diversScore = Math.min(
  100,
  (corrLabels.length / HEALTH_SCORE.IDEAL_HOLDINGS) * 100,
);
const drawScore = Math.max(
  0,
  100 - Math.abs(-18.4) * HEALTH_SCORE.DRAWDOWN_PENALTY,
);
const healthScore = Math.round(
  xirrScore * HEALTH_SCORE.WEIGHTS.XIRR +
    alphaScore * HEALTH_SCORE.WEIGHTS.ALPHA +
    convScore * HEALTH_SCORE.WEIGHTS.CONVICTION +
    diversScore * HEALTH_SCORE.WEIGHTS.DIVERSIFICATION +
    drawScore * HEALTH_SCORE.WEIGHTS.DRAWDOWN,
);

// ─── Root Data Object ─────────────────────────────────────────────────────────
export const phoenixData: PhoenixData = {
  assets,
  netWorth,
  totalInvested,
  totalGains,
  totalGainsPct: Math.round((totalGains / totalInvested) * 1000) / 10,
  totalTax,
  postTaxGains: totalGains - totalTax,
  xirr: portfolioXIRR,
  cagr,
  alpha:
    Math.round((portfolioXIRR - HEALTH_SCORE.ALPHA_BENCHMARK) * 100) / 100,
  dayChange: 12400,
  dayChangePct: 0.32,
  history,
  benchmarks: benchmarksData,
  reports: reportsData,
  corrLabels,
  corrMatrix,
  drawdowns: drawdownsData,
  watchlist,
  transactions,
  goals,
  quarterlyReviews: quarterlyReviewsData,
  convictionAlerts: convictionAlertsData,
  healthScore,
  healthComponents: {
    xirrScore,
    alphaScore,
    convScore,
    diversScore,
    drawScore,
  },
};
