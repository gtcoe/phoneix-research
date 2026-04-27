/**
 * Alert service — resolves conviction alerts shown in TopBar and Dashboard.
 * Current impl: synchronous mock. Backend swap: replace body with fetch('/api/v1/alerts').
 */
import { phoenixData } from "@/lib/data";
import type { ConvictionAlert } from "@/types/alert";

export function getAlerts(): ConvictionAlert[] {
  // TODO: return (await fetch('/api/v1/alerts')).json()
  return phoenixData.convictionAlerts;
}
