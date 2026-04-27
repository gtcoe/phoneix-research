import type { QuarterlyReviewEntry } from "@/types/review";

export const quarterlyReviewsData: QuarterlyReviewEntry[] = [
  // Q3 FY26 (Jan-Mar 2026)
  {
    assetId: 3, // SKYGOLD
    quarter: "Q3 FY26",
    thesisIntact: true,
    result: "beat",
    convictionDelta: "same",
    action: "hold",
    notes:
      "Revenue +28% YoY. Wedding season demand held. B2B franchise expansion on track.",
    completedAt: "2026-01-18",
  },
  {
    assetId: 7, // WEBELSOLAR
    quarter: "Q3 FY26",
    thesisIntact: false,
    result: "miss",
    convictionDelta: "down",
    action: "watch",
    notes:
      "Order book growth slower than expected. Promoter has not reduced pledge yet.",
    completedAt: "2026-01-20",
  },
  {
    assetId: 5, // EFCIL
    quarter: "Q3 FY26",
    thesisIntact: true,
    result: "inline",
    convictionDelta: "same",
    action: "hold",
    notes: "Occupancy at 82% — good. Revenue inline with guidance. Hold.",
    completedAt: "2026-01-22",
  },
  // Q4 FY26 (Apr 2026) — current quarter, only one completed
  {
    assetId: 4, // DEEDEV
    quarter: "Q4 FY26",
    thesisIntact: true,
    result: "beat",
    convictionDelta: "up",
    action: "add",
    notes:
      "Piping order wins in Q4 strong. Nuclear tailwind visible now. Added on dip.",
    completedAt: "2026-04-10",
  },
];
