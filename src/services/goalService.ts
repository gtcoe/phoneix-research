/**
 * Goal service — resolves financial goals.
 * Current impl: synchronous mock. Backend swap: replace body with fetch('/api/v1/goals').
 */
import { phoenixData } from "@/lib/data";
import type { Goal } from "@/types/goal";

export function getGoals(): Goal[] {
  // TODO: return (await fetch('/api/v1/goals')).json()
  return phoenixData.goals;
}
