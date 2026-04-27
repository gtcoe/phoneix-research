/**
 * Benchmark service — resolves benchmark comparison data for the Compare page.
 * Current impl: synchronous mock. Backend swap: replace body with fetch('/api/v1/benchmarks').
 */
import { phoenixData } from "@/lib/data";
import type { BenchmarkSet } from "@/types/benchmark";

export function getBenchmarks(): BenchmarkSet {
  // TODO: return (await fetch('/api/v1/benchmarks')).json()
  return phoenixData.benchmarks;
}
