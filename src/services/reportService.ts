/**
 * Report service — resolves published research reports.
 * Current impl: synchronous mock. Backend swap: replace body with fetch('/api/v1/reports').
 */
import { phoenixData } from "@/lib/data";
import type { Report } from "@/types/report";

export function getReports(): Report[] {
  // TODO: return (await fetch('/api/v1/reports')).json()
  return phoenixData.reports;
}
