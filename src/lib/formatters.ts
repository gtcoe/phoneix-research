export function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2) + "Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(2) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + n.toLocaleString("en-IN");
}
export function fmtPct(n: number | null | undefined, decimals = 1): string {
  if (n == null) return "—";
  const sign = n >= 0 ? "+" : "";
  return sign + n.toFixed(decimals) + "%";
}
export function fmtNum(n: number): string {
  return n.toLocaleString("en-IN");
}
