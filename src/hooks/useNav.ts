"use client";
import { STORAGE_KEYS } from "@/constants/storage";
import { DEFAULT_PAGE } from "@/constants/nav";
import type { Page } from "@/constants/nav";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Manages the active navigation page.
 *
 * - Persists `page` to localStorage so refreshing returns to the same tab.
 * - `navTo` accepts any string and casts it to `Page` (validated at call sites
 *   via NAV_ITEMS — all valid page IDs come from there).
 *
 * @example
 * const { page, navTo } = useNav();
 * navTo("portfolio");
 */
export function useNav() {
  const [page, setPage] = useLocalStorage<string>(STORAGE_KEYS.PAGE, DEFAULT_PAGE);

  const navTo = (p: string) => setPage(p as Page);

  return { page: page as Page, navTo };
}
