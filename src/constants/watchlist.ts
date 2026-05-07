/** Watchlist status constants — single source of truth used by watchlist/index.tsx and WatchCard.tsx */

export const STATUS_OPTIONS = ["watching", "interested", "passed"] as const;

export type WatchStatus = (typeof STATUS_OPTIONS)[number];

export const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: "Watching",
  interested: "Interested",
  passed: "Passed",
};

export const STATUS_COLORS: Record<WatchStatus, string> = {
  watching: "var(--info)",
  interested: "var(--warn)",
  passed: "var(--muted)",
};
