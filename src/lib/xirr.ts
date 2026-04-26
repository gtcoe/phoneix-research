export function calcXIRR(
  cashflows: Array<{ amount: number; date: Date }>,
  guess = 0.1,
): number | null {
  if (!cashflows || cashflows.length < 2) return null;
  const MAX_ITER = 200,
    TOL = 1e-7,
    MS_YR = 365.25 * 24 * 3600 * 1000;
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
    const fv = npv(rate),
      dfv = dnpv(rate);
    if (Math.abs(dfv) < 1e-14) break;
    const nx = rate - fv / dfv;
    if (isNaN(nx) || !isFinite(nx)) break;
    if (Math.abs(nx - rate) < TOL) return Math.round(nx * 10000) / 100;
    rate = nx;
    if (rate < -0.999) rate = -0.5;
  }
  return Math.round(rate * 10000) / 100;
}
