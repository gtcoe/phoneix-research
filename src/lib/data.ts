// Phoenix Research — Data Layer (ported from src/designs/data.js)
// All dates are hardcoded relative to TODAY = April 22, 2026

export function calcXIRR(cashflows: Array<{ amount: number; date: Date }>, guess = 0.1): number | null {
  if (!cashflows || cashflows.length < 2) return null;
  const MAX_ITER = 200, TOL = 1e-7, MS_YR = 365.25 * 24 * 3600 * 1000;
  const t0 = cashflows[0].date.getTime();
  function npv(r: number) {
    let s = 0;
    for (let i = 0; i < cashflows.length; i++) {
      const t = (cashflows[i].date.getTime() - t0) / MS_YR;
      s += cashflows[i].amount / Math.pow(1 + r, t);
    }
    return s;
  }
  function dnpv(r: number) {
    let s = 0;
    for (let i = 0; i < cashflows.length; i++) {
      const t = (cashflows[i].date.getTime() - t0) / MS_YR;
      if (t === 0) continue;
      s += (-t * cashflows[i].amount) / Math.pow(1 + r, t + 1);
    }
    return s;
  }
  let rate = guess;
  for (let i = 0; i < MAX_ITER; i++) {
    const fv = npv(rate), dfv = dnpv(rate);
    if (Math.abs(dfv) < 1e-14) break;
    const nx = rate - fv / dfv;
    if (isNaN(nx) || !isFinite(nx)) break;
    if (Math.abs(nx - rate) < TOL) return Math.round(nx * 10000) / 100;
    rate = nx;
    if (rate < -0.999) rate = -0.5;
  }
  return Math.round(rate * 10000) / 100;
}

const MO: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
export function pd(s: string | null): Date | null {
  if (!s) return null;
  const p = s.split(' ');
  return new Date(parseInt(p[1], 10), MO[p[0]], 15);
}
function pdFull(s: string): Date {
  const p = s.split(' ');
  return new Date(parseInt(p[2], 10), MO[p[0]], parseInt(p[1], 10));
}
const TODAY = new Date(2026, 3, 22);

// ─── Raw Assets ───────────────────────────────────────────────────────────────
const rawAssets = [
  { id: 1,  name: 'NPS Tier I',               ticker: null,         category: 'NPS',        exchange: null,      invested: 450000, current: 583000, qty: null, entryDate: 'Jan 2021', sector: 'Govt Scheme',       rec: null, conviction: null, cashflows: [{ amount: -100000, date: 'Jan 2021' }, { amount: -80000, date: 'Jul 2021' }, { amount: -80000, date: 'Jan 2022' }, { amount: -80000, date: 'Jul 2022' }, { amount: -60000, date: 'Jan 2023' }, { amount: -50000, date: 'Jul 2023' }], entryPrice: null, currentPrice: null, targetPrice: null, targetNote: null },
  { id: 2,  name: 'NPS Tier II',               ticker: null,         category: 'NPS',        exchange: null,      invested: 150000, current: 169000, qty: null, entryDate: 'Jan 2021', sector: 'Govt Scheme',       rec: null, conviction: null, cashflows: [{ amount: -50000, date: 'Jan 2021' }, { amount: -50000, date: 'Jan 2022' }, { amount: -50000, date: 'Jan 2023' }], entryPrice: null, currentPrice: null, targetPrice: null, targetNote: null },
  { id: 3,  name: 'Sky Gold & Diamonds',       ticker: 'SKYGOLD',    category: 'NSE Stocks', exchange: 'NSE',     invested: 280000, current: 344000, qty: 814,  entryDate: 'Mar 2024', sector: 'Jewellery',          rec: 'buy',   conviction: 9, cashflows: [{ amount: -280000, date: 'Mar 2024' }], entryPrice: 344, currentPrice: 423, targetPrice: 750, targetNote: '3x from entry; 129% PAT CAGR' },
  { id: 4,  name: 'DEE Development Eng.',      ticker: 'DEEDEV',     category: 'NSE Stocks', exchange: 'NSE',     invested: 180000, current: 196000, qty: 437,  entryDate: 'Jan 2026', sector: 'Engineering',        rec: 'buy',   conviction: 9, cashflows: [{ amount: -180000, date: 'Jan 2026' }], entryPrice: 412, currentPrice: 449, targetPrice: 850, targetNote: 'Nuclear + hydrogen tailwinds' },
  { id: 5,  name: 'EFC (I) Ltd',               ticker: 'EFCIL',      category: 'NSE Stocks', exchange: 'NSE',     invested: 210000, current: 268000, qty: 562,  entryDate: 'Oct 2024', sector: 'Real Estate',        rec: 'buy',   conviction: 8, cashflows: [{ amount: -210000, date: 'Oct 2024' }], entryPrice: 374, currentPrice: 477, targetPrice: 800, targetNote: '73k seats — re-rate to peers' },
  { id: 6,  name: 'Vintage Coffee',            ticker: 'VINCOFE',    category: 'NSE Stocks', exchange: 'NSE',     invested: 160000, current: 182000, qty: 1240, entryDate: 'Feb 2026', sector: 'FMCG',               rec: 'buy',   conviction: 8, cashflows: [{ amount: -160000, date: 'Feb 2026' }], entryPrice: 129, currentPrice: 147, targetPrice: 320, targetNote: 'CCL Products of 2020 thesis' },
  { id: 7,  name: 'Websol Energy System',      ticker: 'WEBELSOLAR', category: 'NSE Stocks', exchange: 'NSE',     invested: 320000, current: 298000, qty: 986,  entryDate: 'Jun 2024', sector: 'Renewable Energy',   rec: 'buy',   conviction: 8, cashflows: [{ amount: -320000, date: 'Jun 2024' }], entryPrice: 325, currentPrice: 302, targetPrice: 900, targetNote: 'SEZ cost moat; 3x target' },
  { id: 8,  name: 'Subros Ltd',                ticker: 'SUBROS',     category: 'NSE Stocks', exchange: 'NSE',     invested: 140000, current: 157000, qty: 321,  entryDate: 'Nov 2025', sector: 'Auto Components',    rec: 'hold',  conviction: 7, cashflows: [{ amount: -140000, date: 'Nov 2025' }], entryPrice: 436, currentPrice: 489, targetPrice: 650, targetNote: 'EV thermal compounder' },
  { id: 9,  name: 'Apple Inc',                 ticker: 'AAPL',       category: 'US Stocks',  exchange: 'NASDAQ',  invested: 380000, current: 468000, qty: 28,   entryDate: 'Aug 2023', sector: 'Technology',         rec: null,    conviction: null, cashflows: [{ amount: -200000, date: 'Aug 2023' }, { amount: -180000, date: 'Feb 2024' }], entryPrice: 13571, currentPrice: 16714, targetPrice: 22000, targetNote: 'Services flywheel + AI' },
  { id: 10, name: 'Microsoft Corporation',     ticker: 'MSFT',       category: 'US Stocks',  exchange: 'NASDAQ',  invested: 430000, current: 521000, qty: 12,   entryDate: 'Aug 2023', sector: 'Technology',         rec: null,    conviction: null, cashflows: [{ amount: -250000, date: 'Aug 2023' }, { amount: -180000, date: 'Mar 2024' }], entryPrice: 35833, currentPrice: 43417, targetPrice: 58000, targetNote: 'Azure + Copilot monetisation' },
  { id: 11, name: 'SBI Savings Account',       ticker: null,         category: 'Cash',       exchange: null,      invested: 200000, current: 200000, qty: null, entryDate: null,        sector: 'Cash',               rec: null,    conviction: null, cashflows: [], entryPrice: null, currentPrice: null, targetPrice: null, targetNote: null },
  { id: 12, name: 'HDFC Fixed Deposit 7.2%',   ticker: null,         category: 'FD',         exchange: null,      invested: 300000, current: 321600, qty: null, entryDate: 'Apr 2025', sector: 'Fixed Income',       rec: null,    conviction: null, cashflows: [{ amount: -300000, date: 'Apr 2025' }], entryPrice: null, currentPrice: null, targetPrice: null, targetNote: null },
];

const assets = rawAssets.map(a => {
  let xirr: number | null = null;
  if (a.cashflows && a.cashflows.length > 0) {
    const cfs = a.cashflows.map(cf => ({ amount: cf.amount, date: pd(cf.date as string)! }));
    cfs.push({ amount: a.current, date: TODAY });
    cfs.sort((x, y) => x.date.getTime() - y.date.getTime());
    try { xirr = calcXIRR(cfs); } catch (e) { /* ignore */ }
  }
  const entryD = pd(a.entryDate);
  const holdingDays = entryD ? Math.floor((TODAY.getTime() - entryD.getTime()) / (1000 * 3600 * 24)) : null;
  const holdingYears = holdingDays ? holdingDays / 365.25 : null;
  const isLTCG = holdingDays ? holdingDays >= 365 : null;
  const gain = a.current - a.invested;
  let taxRate: number | null = null, taxAmt: number | null = null;
  if (a.category === 'NSE Stocks' || a.category === 'US Stocks') {
    if (isLTCG) { taxRate = 0.10; taxAmt = Math.max(0, gain - 100000) * taxRate; }
    else { taxRate = 0.15; taxAmt = Math.max(0, gain) * taxRate; }
  } else if (a.category === 'FD') { taxRate = 0.30; taxAmt = Math.max(0, gain) * taxRate; }
  else if (a.category === 'NPS') { taxRate = 0; taxAmt = 0; }
  return {
    id: a.id, name: a.name, ticker: a.ticker, category: a.category, exchange: a.exchange,
    invested: a.invested, current: a.current, qty: a.qty ?? null, entryDate: a.entryDate ?? null,
    sector: a.sector, rec: a.rec ?? null, conviction: a.conviction ?? null, xirr,
    entryPrice: a.entryPrice ?? null, currentPrice: a.currentPrice ?? null,
    targetPrice: a.targetPrice ?? null, targetNote: a.targetNote ?? null,
    holdingDays, holdingYears, isLTCG,
    gain, gainPct: a.invested > 0 ? gain / a.invested * 100 : 0,
    taxRate, taxAmt,
    postTaxGain: gain - (taxAmt ?? 0),
  };
});

// Portfolio XIRR
const netWorth = assets.reduce((s, a) => s + a.current, 0);
const allCFs: Array<{ amount: number; date: Date }> = [];
rawAssets.forEach(a => {
  a.cashflows.forEach(cf => { allCFs.push({ amount: cf.amount, date: pd(cf.date as string)! }); });
});
allCFs.push({ amount: netWorth, date: TODAY });
allCFs.sort((a, b) => a.date.getTime() - b.date.getTime());
let portfolioXIRR = 18.4;
try { portfolioXIRR = calcXIRR(allCFs) ?? 18.4; } catch (e) { /* ignore */ }

const totalInvested = assets.reduce((s, a) => s + a.invested, 0);
const totalGains = netWorth - totalInvested;
const totalTax = assets.reduce((s, a) => s + (a.taxAmt ?? 0), 0);
const cagr = Math.round((Math.pow(netWorth / 2180000, 12 / 18) - 1) * 1000) / 10;

// ─── Performance History ──────────────────────────────────────────────────────
const bumps = [0, 0.02, -0.015, 0.03, 0.01, -0.02, 0.025, 0.015, 0.03, -0.01, 0.04, 0.02, 0.01, 0.03, -0.005, 0.035, 0.02, 0];
const histStart = 2180000;
// 18 months: Nov 2024 → Apr 2026 (i=17 down to 0, date = new Date(2026, 3-i, 1))
const histDates = ['Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26'];
const history = histDates.map((date, idx) => {
  const t = idx / 17;
  return { date, value: Math.round(histStart + (netWorth - histStart) * Math.pow(t, 0.8) + bumps[idx] * histStart) };
});

// ─── Benchmarks ───────────────────────────────────────────────────────────────
const niftyBumps = [0, 0.015, -0.02, 0.025, 0.005, -0.015, 0.02, 0.01, 0.015, -0.005, 0.02, 0.01, 0.005, 0.015, -0.01, 0.02, 0.008, 0];
const midcapBumps = [0, 0.025, -0.03, 0.04, 0.015, -0.025, 0.03, 0.02, 0.04, -0.015, 0.05, 0.025, 0.015, 0.04, -0.01, 0.045, 0.025, 0];
const niftyEnd = histStart * Math.pow(1.12, 18 / 12), midcapEnd = histStart * Math.pow(1.18, 18 / 12);
const niftyHistory = histDates.map((date, idx) => { const tt = idx / 17; return { date, value: Math.round(histStart + (niftyEnd - histStart) * Math.pow(tt, 0.85) + niftyBumps[idx] * histStart) }; });
const midcapHistory = histDates.map((date, idx) => { const tt = idx / 17; return { date, value: Math.round(histStart + (midcapEnd - histStart) * Math.pow(tt, 0.85) + midcapBumps[idx] * histStart) }; });
const fdHistory = histDates.map((date, idx) => { const tt = idx / 17; return { date, value: Math.round(histStart * Math.pow(1.072, tt * 18 / 12)) }; });
const benchmarks = {
  nifty50: { label: 'Nifty 50', color: 'oklch(0.64 0.14 248)', xirr: 12.0, cagr: 12.0, history: niftyHistory },
  midcap150: { label: 'Nifty Midcap 150', color: 'oklch(0.72 0.14 75)', xirr: 18.2, cagr: 18.2, history: midcapHistory },
  fd: { label: 'Fixed Deposit', color: 'oklch(0.68 0.08 240)', xirr: 7.2, cagr: 7.2, history: fdHistory },
};

// ─── Transaction Log ──────────────────────────────────────────────────────────
const transactions = [
  { id: 't1',  date: 'Jan 15 2021', type: 'buy', asset: 'NPS Tier I',          ticker: null,         amount: 100000, qty: null, price: null,   notes: 'Started NPS. First contribution.', category: 'NPS' },
  { id: 't2',  date: 'Jan 15 2021', type: 'buy', asset: 'NPS Tier II',         ticker: null,         amount: 50000,  qty: null, price: null,   notes: 'Tier II for liquidity.', category: 'NPS' },
  { id: 't3',  date: 'Jul 15 2021', type: 'buy', asset: 'NPS Tier I',          ticker: null,         amount: 80000,  qty: null, price: null,   notes: 'Mid-year top-up.', category: 'NPS' },
  { id: 't4',  date: 'Jan 15 2022', type: 'buy', asset: 'NPS Tier I',          ticker: null,         amount: 80000,  qty: null, price: null,   notes: 'Annual NPS contribution.', category: 'NPS' },
  { id: 't5',  date: 'Jan 15 2022', type: 'buy', asset: 'NPS Tier II',         ticker: null,         amount: 50000,  qty: null, price: null,   notes: 'NPS Tier II annual.', category: 'NPS' },
  { id: 't6',  date: 'Jan 15 2023', type: 'buy', asset: 'NPS Tier I',          ticker: null,         amount: 80000,  qty: null, price: null,   notes: 'NPS annual.', category: 'NPS' },
  { id: 't7',  date: 'Jan 15 2023', type: 'buy', asset: 'NPS Tier II',         ticker: null,         amount: 50000,  qty: null, price: null,   notes: 'NPS Tier II.', category: 'NPS' },
  { id: 't8',  date: 'Jul 15 2023', type: 'buy', asset: 'NPS Tier I',          ticker: null,         amount: 60000,  qty: null, price: null,   notes: 'Extra top-up before tax season.', category: 'NPS' },
  { id: 't9',  date: 'Aug 15 2023', type: 'buy', asset: 'Apple Inc',           ticker: 'AAPL',       amount: 200000, qty: 14,   price: 14286,  notes: 'Initiated AAPL. Services narrative compelling.', category: 'US Stocks' },
  { id: 't10', date: 'Aug 15 2023', type: 'buy', asset: 'Microsoft Corp.',     ticker: 'MSFT',       amount: 250000, qty: 6,    price: 41667,  notes: 'MSFT + Azure cloud moat. Copilot optionality.', category: 'US Stocks' },
  { id: 't11', date: 'Mar 15 2024', type: 'buy', asset: 'Sky Gold & Diamonds', ticker: 'SKYGOLD',    amount: 280000, qty: 814,  price: 344,    notes: 'B2B jewellery play. 129% PAT CAGR. Entry after studying sector for 3 months.', category: 'NSE Stocks' },
  { id: 't12', date: 'Feb 15 2024', type: 'buy', asset: 'Apple Inc',           ticker: 'AAPL',       amount: 180000, qty: 14,   price: 12857,  notes: 'Added more AAPL. Avg down after correction.', category: 'US Stocks' },
  { id: 't13', date: 'Mar 15 2024', type: 'buy', asset: 'Microsoft Corp.',     ticker: 'MSFT',       amount: 180000, qty: 6,    price: 30000,  notes: 'Added MSFT. Vision Pro reaction overdone.', category: 'US Stocks' },
  { id: 't14', date: 'Jun 15 2024', type: 'buy', asset: 'Websol Energy',       ticker: 'WEBELSOLAR', amount: 320000, qty: 986,  price: 325,    notes: 'Solar manufacturing. SEZ cost advantage + policy tailwind. Falta location moat.', category: 'NSE Stocks' },
  { id: 't15', date: 'Jul 15 2023', type: 'buy', asset: 'NPS Tier I',          ticker: null,         amount: 50000,  qty: null, price: null,   notes: 'NPS top-up.', category: 'NPS' },
  { id: 't16', date: 'Oct 15 2024', type: 'buy', asset: 'EFC (I) Ltd',         ticker: 'EFCIL',      amount: 210000, qty: 562,  price: 374,    notes: 'First listed managed workspace co. Undervalued vs peers. Asset-light.', category: 'NSE Stocks' },
  { id: 't17', date: 'Nov 15 2025', type: 'buy', asset: 'Subros Ltd',          ticker: 'SUBROS',     amount: 140000, qty: 321,  price: 436,    notes: 'EV thermal management. Denso JV moat. Hold alongside EPACK.', category: 'NSE Stocks' },
  { id: 't18', date: 'Jan 15 2026', type: 'buy', asset: 'DEE Development',     ticker: 'DEEDEV',     amount: 180000, qty: 437,  price: 412,    notes: 'Largest integrated process piping. Nuclear + H2 tailwinds. Cheap at 13-19x FY27.', category: 'NSE Stocks' },
  { id: 't19', date: 'Feb 15 2026', type: 'buy', asset: 'Vintage Coffee',      ticker: 'VINCOFE',    amount: 160000, qty: 1240, price: 129,    notes: '100% capacity utilisation before new capacity. CCL Products of 2020.', category: 'NSE Stocks' },
  { id: 't20', date: 'Apr 15 2025', type: 'buy', asset: 'HDFC FD 7.2%',        ticker: null,         amount: 300000, qty: null, price: null,   notes: '1yr FD at 7.2%. Parked surplus while researching next idea.', category: 'FD' },
].map(t => ({ ...t, dateObj: pdFull(t.date) }))
  .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

// ─── Goals ────────────────────────────────────────────────────────────────────
const goals = [
  { id: 'g1', name: 'Financial Independence', targetAmount: 20000000, targetYear: 2035, currentAmount: netWorth,                    monthlyAddition: 50000, icon: '🏔️', color: 'var(--accent)' },
  { id: 'g2', name: 'Dream Home Down Payment', targetAmount: 5000000,  targetYear: 2028, currentAmount: netWorth * 0.18,             monthlyAddition: 25000, icon: '🏠', color: 'oklch(0.64 0.14 248)' },
  { id: 'g3', name: 'Child Education Fund',    targetAmount: 3000000,  targetYear: 2032, currentAmount: 169000 + 150000,             monthlyAddition: 15000, icon: '🎓', color: 'oklch(0.62 0.14 160)' },
];

// ─── Correlation Matrix ───────────────────────────────────────────────────────
const corrLabels = ['SKYGOLD', 'DEEDEV', 'EFCIL', 'VINCOFE', 'WEBELSOLAR', 'SUBROS', 'AAPL', 'MSFT'];
const corrMatrix = [
  [1.00, 0.31, 0.28, 0.22, 0.35, 0.29, 0.18, 0.17],
  [0.31, 1.00, 0.42, 0.25, 0.58, 0.48, 0.21, 0.19],
  [0.28, 0.42, 1.00, 0.31, 0.38, 0.35, 0.24, 0.22],
  [0.22, 0.25, 0.31, 1.00, 0.27, 0.23, 0.31, 0.29],
  [0.35, 0.58, 0.38, 0.27, 1.00, 0.44, 0.26, 0.24],
  [0.29, 0.48, 0.35, 0.23, 0.44, 1.00, 0.22, 0.20],
  [0.18, 0.21, 0.24, 0.31, 0.26, 0.22, 1.00, 0.82],
  [0.17, 0.19, 0.22, 0.29, 0.24, 0.20, 0.82, 1.00],
];

// ─── Drawdowns ────────────────────────────────────────────────────────────────
const drawdowns = [
  { ticker: 'SKYGOLD',    name: 'Sky Gold',        entry: 344, ath: 498, current: 423, maxDD: -15.1, curDD: -15.1, recoveryNeeded: 17.7 },
  { ticker: 'DEEDEV',     name: 'DEE Development', entry: 412, ath: 510, current: 449, maxDD: -12.0, curDD: -11.9, recoveryNeeded: 13.6 },
  { ticker: 'EFCIL',      name: 'EFC (I) Ltd',     entry: 374, ath: 520, current: 477, maxDD:  -8.3, curDD:  -8.3, recoveryNeeded:  9.0 },
  { ticker: 'VINCOFE',    name: 'Vintage Coffee',  entry: 129, ath: 165, current: 147, maxDD: -10.9, curDD: -10.9, recoveryNeeded: 12.2 },
  { ticker: 'WEBELSOLAR', name: 'Websol Energy',   entry: 325, ath: 398, current: 302, maxDD: -24.1, curDD: -24.1, recoveryNeeded: 31.8 },
  { ticker: 'SUBROS',     name: 'Subros Ltd',      entry: 436, ath: 532, current: 489, maxDD:  -8.1, curDD:  -8.1, recoveryNeeded:  8.8 },
  { ticker: 'AAPL',       name: 'Apple Inc',       entry: 178, ath: 259, current: 213, maxDD: -17.8, curDD: -17.8, recoveryNeeded: 21.6 },
  { ticker: 'MSFT',       name: 'Microsoft',       entry: 330, ath: 468, current: 395, maxDD: -15.6, curDD: -15.6, recoveryNeeded: 18.5 },
];

// ─── Conviction Alerts ────────────────────────────────────────────────────────
const convictionAlerts = [
  { id: 'ca1', ticker: 'WEBELSOLAR', name: 'Websol Energy',    severity: 'high',   type: 'thesis_risk',    message: 'Stock is -7.1% from entry. Chinese module dumping risk elevated. Review thesis validity.',     date: 'Apr 20 2026', read: false },
  { id: 'ca2', ticker: 'INDOTECH',   name: 'Indo Tech Trans.', severity: 'high',   type: 'governance',     message: 'Promoter pledge still at 77%. No reduction in 2 quarters. Red flag unresolved.',                date: 'Apr 18 2026', read: false },
  { id: 'ca3', ticker: 'RBZJEWEL',   name: 'RBZ Jewellers',    severity: 'medium', type: 'guidance_cut',   message: 'Guidance cut for 3rd consecutive quarter. B2B→B2C transition slower than expected.',            date: 'Apr 15 2026', read: true },
  { id: 'ca4', ticker: 'CELLECOR',   name: 'Cellecor Gadgets', severity: 'medium', type: 'margin_stagnant',message: 'PAT margins at 3.1% — unchanged for 4th year. Thesis requires margin expansion proof.',           date: 'Apr 10 2026', read: true },
  { id: 'ca5', ticker: 'DEEDEV',     name: 'DEE Development',  severity: 'low',    type: 'positive',       message: 'Q4 FY26 order book up 34% QoQ. Nuclear order pipeline firming up. Thesis intact ✓',            date: 'Apr 22 2026', read: false },
  { id: 'ca6', ticker: 'SKYGOLD',    name: 'Sky Gold',         severity: 'low',    type: 'positive',       message: 'FY26 revenue guidance reiterated. Malabar Gold expansion creates new volume visibility.',        date: 'Apr 19 2026', read: true },
];

// ─── Watchlist ────────────────────────────────────────────────────────────────
const watchlist = [
  { id: 'w1', ticker: 'RBZJEWEL',  name: 'RBZ Jewellers',           exchange: 'NSE',     sector: 'Jewellery',          rec: 'watch', conviction: 6,    mcap: '₹584 Cr',    alertPrice: 195,  currentPrice: 181,  priceAtAdd: 168,  addedDate: 'Jan 10 2026', thesis: 'Best-in-class 12% EBITDA margins. Antique gold moat. Watch B2B→B2C transition quarterly.', status: 'watching',   file: 'analyses/rbz_analysis.html' },
  { id: 'w2', ticker: 'GCHOTELS',  name: 'Grand Continent Hotels',   exchange: 'NSE SME', sector: 'Hospitality',        rec: 'watch', conviction: 5,    mcap: '₹246 Cr',    alertPrice: 85,   currentPrice: 74,   priceAtAdd: 61,   addedDate: 'Feb 03 2026', thesis: '133% revenue growth FY25. Asset-light lease model. Watch occupancy quarterly.', status: 'watching',   file: 'analyses/gchotels_analysis.html' },
  { id: 'w3', ticker: 'NAMOEWASTE',name: 'Namo eWaste Management',   exchange: 'NSE SME', sector: 'e-Waste',            rec: 'watch', conviction: 5,    mcap: '₹395 Cr',    alertPrice: 145,  currentPrice: 128,  priceAtAdd: 142,  addedDate: 'Mar 15 2026', thesis: '50% revenue CAGR. India EPR mandate tailwind. Needs consistent execution.', status: 'interested', file: 'analyses/namoewaste_analysis.html' },
  { id: 'w4', ticker: 'INDOTECH',  name: 'Indo Tech Transformers',   exchange: 'NSE',     sector: 'Capital Goods',      rec: 'watch', conviction: 4,    mcap: '₹1,406 Cr',  alertPrice: 620,  currentPrice: 584,  priceAtAdd: 598,  addedDate: 'Feb 20 2026', thesis: '7 consecutive PAT improvement quarters. Watch promoter pledge reduction — key trigger.', status: 'watching',   file: 'analyses/indo_tech_transformers_analysis.html' },
  { id: 'w5', ticker: 'CELLECOR',  name: 'Cellecor Gadgets',         exchange: 'NSE SME', sector: 'Consumer Electronics',rec: 'watch', conviction: 3,   mcap: '₹671 Cr',    alertPrice: 38,   currentPrice: 34,   priceAtAdd: 36,   addedDate: 'Mar 01 2026', thesis: '₹1,026 Cr revenue. 3% PAT margins stagnant — need margin expansion proof.', status: 'passed',     file: 'analyses/cellecor_analysis.html' },
  { id: 'w6', ticker: 'EPACK',     name: 'EPACK Durable',            exchange: 'NSE',     sector: 'Consumer Durables',  rec: null,    conviction: null, mcap: '₹2,100 Cr',  alertPrice: 280,  currentPrice: 261,  priceAtAdd: 241,  addedDate: 'Jan 25 2026', thesis: 'Room AC ODM play. Subros partnership. Yet to research fully.', status: 'interested', file: null },
  { id: 'w7', ticker: 'CAMS',      name: 'CAMS',                     exchange: 'NSE',     sector: 'Financial Services', rec: null,    conviction: null, mcap: '₹18,000 Cr', alertPrice: 1450, currentPrice: 1382, priceAtAdd: 1290, addedDate: 'Dec 12 2025', thesis: 'MF registrar duopoly with Kfin. Regulatory moat. SIP growth tailwind.', status: 'interested', file: null },
];

// ─── Reports ─────────────────────────────────────────────────────────────────
const reports = [
  { slug: 'skygold',        name: 'Sky Gold & Diamonds',        ticker: 'SKYGOLD',    date: 'April 2025', sector: 'Jewellery',          rec: 'buy',   conviction: 9, file: 'analyses/skygold_analysis.html' },
  { slug: 'deedev',         name: 'DEE Development Engineers',  ticker: 'DEEDEV',     date: 'April 2026', sector: 'Engineering',        rec: 'buy',   conviction: 9, file: 'analyses/deedev_analysis.html' },
  { slug: 'efc',            name: 'EFC (I) Ltd',                ticker: 'EFCIL',      date: 'April 2026', sector: 'Real Estate',        rec: 'buy',   conviction: 8, file: 'analyses/efc_analysis.html' },
  { slug: 'vintage-coffee', name: 'Vintage Coffee & Beverages', ticker: 'VINCOFE',    date: 'April 2026', sector: 'FMCG',               rec: 'buy',   conviction: 8, file: 'analyses/vintage-coffee_analysis.html' },
  { slug: 'websol',         name: 'Websol Energy System',       ticker: 'WEBELSOLAR', date: 'April 2026', sector: 'Renewable Energy',   rec: 'buy',   conviction: 8, file: 'analyses/websol_analysis.html' },
  { slug: 'subros',         name: 'Subros Ltd',                 ticker: 'SUBROS',     date: 'April 2026', sector: 'Auto Components',    rec: 'hold',  conviction: 7, file: 'analyses/subros_analysis.html' },
  { slug: 'rbz',            name: 'RBZ Jewellers',              ticker: 'RBZJEWEL',   date: 'April 2026', sector: 'Jewellery',          rec: 'watch', conviction: 6, file: 'analyses/rbz_analysis.html' },
  { slug: 'gchotels',       name: 'Grand Continent Hotels',     ticker: 'GCHOTELS',   date: 'April 2026', sector: 'Hospitality',        rec: 'watch', conviction: 5, file: 'analyses/gchotels_analysis.html' },
  { slug: 'namoewaste',     name: 'Namo eWaste Management',     ticker: 'NAMOEWASTE', date: 'April 2026', sector: 'e-Waste',            rec: 'watch', conviction: 5, file: 'analyses/namoewaste_analysis.html' },
  { slug: 'indotech',       name: 'Indo Tech Transformers',     ticker: 'INDOTECH',   date: 'April 2026', sector: 'Capital Goods',      rec: 'watch', conviction: 4, file: 'analyses/indo_tech_transformers_analysis.html' },
  { slug: 'cellecor',       name: 'Cellecor Gadgets Ltd',       ticker: 'CELLECOR',   date: 'April 2026', sector: 'Consumer Electronics', rec: 'watch', conviction: 3, file: 'analyses/cellecor_analysis.html' },
  { slug: 'anant-raj',     name: 'Anant Raj Ltd',              ticker: 'ANANTRAJ',   date: 'April 2026', sector: 'Real Estate',          rec: 'hold',  conviction: 8, file: 'analyses/anant_raj_analysis.html' },
  { slug: 'borana-weaves', name: 'Borana Weaves Ltd',          ticker: 'BORANA',     date: 'April 2026', sector: 'Textiles',             rec: 'buy',   conviction: 8, file: 'analyses/borana_weaves_analysis.html' },
  { slug: 'rpsg-ventures', name: 'RPSG Ventures Ltd',          ticker: 'RPSGVENT',   date: 'April 2026', sector: 'Diversified',          rec: 'buy',   conviction: 8, file: 'analyses/rpsg_ventures_analysis.html' },
  { slug: 'taril',         name: 'TARIL (Transformers)',        ticker: 'TARIL',      date: 'April 2026', sector: 'Capital Goods',        rec: 'hold',  conviction: 7, file: 'analyses/taril_analysis.html' },
  { slug: 'zaggle',        name: 'Zaggle Prepaid Ocean Svcs',  ticker: 'ZAGGLE',     date: 'April 2026', sector: 'Fintech',              rec: 'hold',  conviction: 7, file: 'analyses/zaggle_analysis.html' },
  { slug: 'ideaforge',     name: 'ideaForge Technology',        ticker: 'IDEAFORGE',  date: 'April 2026', sector: 'Aerospace & Defence', rec: 'buy',   conviction: 7, file: 'analyses/ideaforge_analysis.html' },
  { slug: 'nurture-well',  name: 'Nurture Well Industries',    ticker: 'NWIL',       date: 'April 2026', sector: 'FMCG',                rec: 'buy',   conviction: 7, file: 'analyses/nurture_well_analysis.html' },
  { slug: 'quality-power', name: 'Quality Power Electrical',   ticker: 'QPOWER',     date: 'April 2026', sector: 'Capital Goods',        rec: 'watch', conviction: 6, file: 'analyses/quality_power_analysis.html' },
  { slug: 'capacite',      name: "Capacit'e Infraprojects",    ticker: 'CAPACITE',   date: 'April 2026', sector: 'Construction',         rec: 'hold',  conviction: 5, file: 'analyses/capacite_analysis.html' },
  { slug: 'rbm-infracon',  name: 'RBM Infracon Ltd',           ticker: 'RBMINFRA',   date: 'April 2026', sector: 'Engineering',          rec: 'hold',  conviction: 5, file: 'analyses/rbm_infracon_analysis.html' },
];

// ─── Portfolio Health Score ───────────────────────────────────────────────────
const equityAssets = assets.filter(a => a.rec);
const avgConviction = equityAssets.reduce((s, a) => s + (a.conviction ?? 0), 0) / (equityAssets.length || 1);
const xirrScore    = Math.min(100, portfolioXIRR / 25 * 100);
const alphaScore   = Math.min(100, Math.max(0, (portfolioXIRR - 12) / 10 * 100));
const convScore    = avgConviction / 10 * 100;
const diversScore  = Math.min(100, corrLabels.length / 8 * 100);
const drawScore    = Math.max(0, 100 - Math.abs(-18.4) * 2.5);
const healthScore  = Math.round(xirrScore * 0.3 + alphaScore * 0.25 + convScore * 0.2 + diversScore * 0.15 + drawScore * 0.1);

export const phoenixData = {
  assets, netWorth, totalInvested, totalGains,
  totalGainsPct: Math.round(totalGains / totalInvested * 1000) / 10,
  totalTax, postTaxGains: totalGains - totalTax,
  xirr: portfolioXIRR, cagr, alpha: Math.round((portfolioXIRR - 12) * 100) / 100,
  dayChange: 12400, dayChangePct: 0.32,
  history, benchmarks, reports,
  corrLabels, corrMatrix, drawdowns,
  watchlist, transactions, goals, convictionAlerts,
  healthScore,
  healthComponents: { xirrScore, alphaScore, convScore, diversScore, drawScore },
};

export type PhoenixData = typeof phoenixData;
