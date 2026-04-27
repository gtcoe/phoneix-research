import type { PerformancePoint } from "@/types/portfolio";
import type { BenchmarkSet } from "@/types/benchmark";
import { histStart, histDates } from "./history";

const niftyBumps: number[] = [
  0, 0.015, -0.02, 0.025, 0.005, -0.015, 0.02, 0.01, 0.015, -0.005, 0.02, 0.01,
  0.005, 0.015, -0.01, 0.02, 0.008, 0,
];
const midcapBumps: number[] = [
  0, 0.025, -0.03, 0.04, 0.015, -0.025, 0.03, 0.02, 0.04, -0.015, 0.05, 0.025,
  0.015, 0.04, -0.01, 0.045, 0.025, 0,
];

const niftyEnd = histStart * Math.pow(1.12, 18 / 12);
const midcapEnd = histStart * Math.pow(1.18, 18 / 12);

const niftyHistory: PerformancePoint[] = histDates.map((date, idx) => {
  const tt = idx / 17;
  return {
    date,
    value: Math.round(
      histStart +
        (niftyEnd - histStart) * Math.pow(tt, 0.85) +
        niftyBumps[idx] * histStart,
    ),
  };
});

const midcapHistory: PerformancePoint[] = histDates.map((date, idx) => {
  const tt = idx / 17;
  return {
    date,
    value: Math.round(
      histStart +
        (midcapEnd - histStart) * Math.pow(tt, 0.85) +
        midcapBumps[idx] * histStart,
    ),
  };
});

const fdHistory: PerformancePoint[] = histDates.map((date, idx) => {
  const tt = idx / 17;
  return {
    date,
    value: Math.round(histStart * Math.pow(1.072, (tt * 18) / 12)),
  };
});

export const benchmarksData: BenchmarkSet = {
  nifty50: {
    label: "Nifty 50",
    color: "oklch(0.64 0.14 248)",
    xirr: 12.0,
    cagr: 12.0,
    history: niftyHistory,
  },
  midcap150: {
    label: "Nifty Midcap 150",
    color: "oklch(0.72 0.14 75)",
    xirr: 18.2,
    cagr: 18.2,
    history: midcapHistory,
  },
  fd: {
    label: "Fixed Deposit",
    color: "oklch(0.68 0.08 240)",
    xirr: 7.2,
    cagr: 7.2,
    history: fdHistory,
  },
};
