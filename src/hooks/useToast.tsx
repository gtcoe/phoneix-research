"use client";
import React, { createContext, useCallback, useContext, useId, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warn";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastAPI {
  show: (message: string, type?: ToastType) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastAPI>({ show: () => {} });
const ToastListContext = createContext<Toast[]>([]);

// ─── Provider ─────────────────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 2500;

/**
 * Mount once in the root layout (PhoenixApp.tsx).
 * Any child can call `useToast().show("message", "success")`.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, AUTO_DISMISS_MS);
  }, []);

  const api: ToastAPI = { show };

  return (
    <ToastContext.Provider value={api}>
      <ToastListContext.Provider value={toasts}>
        {children}
      </ToastListContext.Provider>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/** Returns `{ show }` — call `show("message", "success")` from any component. */
export function useToast(): ToastAPI {
  return useContext(ToastContext);
}

// ─── Internal helper (exported for ToastContainer) ────────────────────────────

export function useToastList(): Toast[] {
  return useContext(ToastListContext);
}
