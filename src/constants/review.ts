/**
 * Review-related constants.
 * QUARTERS will eventually come from GET /api/v1/reviews/quarters.
 * Keep them here so the component stays clean and a future API call
 * is a one-line swap in reviewService.ts.
 */
export const QUARTERS = ["Q3 FY26", "Q4 FY26"] as const;

export type Quarter = (typeof QUARTERS)[number];
