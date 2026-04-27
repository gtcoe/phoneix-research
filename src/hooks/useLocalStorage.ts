"use client";
import { useState, useEffect } from "react";

/**
 * Generic localStorage hook.
 *
 * Supports string, boolean, and number primitives.
 * - Strings are stored as-is.
 * - Booleans are stored as "true" / "false".
 * - Numbers are stored via String() and parsed back with Number().
 *
 * Falls back to `initialValue` when:
 * - Running server-side (SSR/SSG — no window)
 * - No value exists in localStorage for the key
 *
 * @example
 * const [page, setPage] = useLocalStorage("px-page", "dashboard");
 * const [collapsed, setCollapsed] = useLocalStorage("px-collapsed", false);
 */
export function useLocalStorage<T extends string | boolean | number>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    const item = localStorage.getItem(key);
    if (item === null) return initialValue;

    if (typeof initialValue === "boolean") return (item === "true") as T;
    if (typeof initialValue === "number")  return Number(item) as T;
    return item as T;
  });

  useEffect(() => {
    localStorage.setItem(key, String(storedValue));
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
