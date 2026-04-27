/**
 * Navigation constants.
 * All page IDs, labels, icons, and ordering live here — one place to add/rename a page.
 */

/** All navigable pages in the app. */
export type Page =
  | "dashboard"
  | "portfolio"
  | "analysis"
  | "compare"
  | "watchlist"
  | "reports"
  | "journal"
  | "tools"
  | "review";

export const DEFAULT_PAGE: Page = "dashboard";

/** Sidebar navigation items — order here controls render order. */
export const NAV_ITEMS: Array<{ id: Page; label: string; icon: string }> = [
  { id: "dashboard",  label: "Dashboard",       icon: "dashboard" },
  { id: "portfolio",  label: "Portfolio",        icon: "portfolio" },
  { id: "analysis",   label: "Analysis",         icon: "analysis"  },
  { id: "compare",    label: "Compare",          icon: "trend"     },
  { id: "watchlist",  label: "Watchlist",        icon: "watchlist" },
  { id: "reports",    label: "Reports",          icon: "reports"   },
  { id: "journal",    label: "Journal",          icon: "note"      },
  { id: "tools",      label: "Tools",            icon: "tools"     },
  { id: "review",     label: "Quarterly Review", icon: "review"    },
];

/**
 * Human-readable page names for the TopBar title.
 * Keyed by Page — TypeScript will catch missing/extra keys.
 */
export const PAGE_NAMES: Record<Page, string> = {
  dashboard: "Dashboard",
  portfolio: "Portfolio",
  analysis:  "Analysis",
  compare:   "Compare",
  watchlist: "Watchlist",
  reports:   "Reports",
  journal:   "Journal",
  tools:     "Tools",
  review:    "Quarterly Review",
};
