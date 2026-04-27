"use client";
import { useEffect } from "react";
import { THEMES, DEFAULT_THEME } from "@/lib/theme";
import { STORAGE_KEYS } from "@/constants/storage";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Manages the active theme.
 *
 * - Persists `themeName` to localStorage via useLocalStorage.
 * - Applies CSS custom properties to <html> on every change.
 * - Exposes the full list of available theme names for the theme picker.
 *
 * @example
 * const { themeName, setThemeName, themeNames } = useTheme();
 */
export function useTheme() {
  const [themeName, setThemeName] = useLocalStorage<string>(
    STORAGE_KEYS.THEME,
    DEFAULT_THEME,
  );

  useEffect(() => {
    const root = document.documentElement;
    const theme =
      THEMES[themeName as keyof typeof THEMES] || THEMES[DEFAULT_THEME];
    Object.entries(theme).forEach(([k, v]) =>
      root.style.setProperty(k, v as string),
    );
    root.style.setProperty(
      "color-scheme",
      themeName !== "Pro Light" ? "dark" : "light",
    );
  }, [themeName]);

  return {
    themeName,
    setThemeName,
    themeNames: Object.keys(THEMES),
  };
}
