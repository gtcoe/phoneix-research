/** Starting portfolio value (Nov 2024) used for history & benchmark charts. */
export const histStart = 2180000;

/** 18-month date labels: Nov 2024 → Apr 2026. */
export const histDates: string[] = [
  "Nov 24",
  "Dec 24",
  "Jan 25",
  "Feb 25",
  "Mar 25",
  "Apr 25",
  "May 25",
  "Jun 25",
  "Jul 25",
  "Aug 25",
  "Sep 25",
  "Oct 25",
  "Nov 25",
  "Dec 25",
  "Jan 26",
  "Feb 26",
  "Mar 26",
  "Apr 26",
];

/** Per-month bump factors applied to the portfolio history curve. */
export const histBumps: number[] = [
  0, 0.02, -0.015, 0.03, 0.01, -0.02, 0.025, 0.015, 0.03, -0.01, 0.04, 0.02,
  0.01, 0.03, -0.005, 0.035, 0.02, 0,
];
