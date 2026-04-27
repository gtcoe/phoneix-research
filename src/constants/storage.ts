/**
 * localStorage key constants.
 * Centralised so a typo in a key name doesn't silently create orphaned entries.
 * All keys are prefixed with "px-" (Phoenix).
 */
export const STORAGE_KEYS = {
  /** Active page tab — persisted so refreshing returns to the same page */
  PAGE: "px-page",
  /** Active theme name — persisted across sessions */
  THEME: "px-theme",
  /** Whether the sidebar is in collapsed (icon-only) mode */
  SIDEBAR_COLLAPSED: "px-collapsed",
} as const;
