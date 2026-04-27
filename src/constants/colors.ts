/**
 * Shared color maps for charts and badges across all pages.
 * Define here so changing one sector/category color updates every chart at once.
 */

/** Maps stock sector names → chart hex color */
export const SECTOR_COLORS: Record<string, string> = {
  Technology: "#6366f1",
  Manufacturing: "#f59e0b",
  Finance: "#10b981",
  Infrastructure: "#3b82f6",
  Consumer: "#ec4899",
  Energy: "#f97316",
  Healthcare: "#14b8a6",
};

/** Maps market-cap category names → chart hex color */
export const CATEGORY_COLORS: Record<string, string> = {
  "Large Cap": "#6366f1",
  "Mid Cap": "#f59e0b",
  "Small Cap": "#10b981",
  "Micro Cap": "#3b82f6",
};
