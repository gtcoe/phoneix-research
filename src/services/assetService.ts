/**
 * Asset service — resolves asset holdings and drawdown data.
 * Current impl: synchronous mock. Backend swap: replace body with fetch('/api/v1/assets').
 */
import { phoenixData } from "@/lib/data";
import type { Asset, DrawdownEntry } from "@/types/asset";

export function getAssets(): Asset[] {
  // TODO: return (await fetch('/api/v1/assets')).json()
  return phoenixData.assets;
}

export function getDrawdowns(): DrawdownEntry[] {
  // TODO: return (await fetch('/api/v1/assets/drawdowns')).json()
  return phoenixData.drawdowns;
}
