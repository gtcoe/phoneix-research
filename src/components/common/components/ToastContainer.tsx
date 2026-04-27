"use client";
import { useToastList, type ToastType } from "@/hooks/useToast";

// ─── Per-type styles ──────────────────────────────────────────────────────────

const TYPE_STYLES: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: "var(--gain)", icon: "✓" },
  error:   { bg: "var(--loss)", icon: "✕" },
  warn:    { bg: "var(--warn, #f59e0b)", icon: "⚠" },
  info:    { bg: "var(--info, #3b82f6)", icon: "ℹ" },
};

/**
 * Renders active toasts in the bottom-right corner.
 * Mount once inside <ToastProvider> in PhoenixApp.tsx — no extra state needed.
 *
 * @example
 *   // PhoenixApp.tsx
 *   <ToastProvider>
 *     ...layout...
 *     <ToastContainer />
 *   </ToastProvider>
 */
export function ToastContainer() {
  const toasts = useToastList();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        const s = TYPE_STYLES[t.type];
        return (
          <div
            key={t.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: s.bg,
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 13,
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              animation: "toast-in 0.2s ease",
            }}
          >
            <span style={{ fontSize: 15 }}>{s.icon}</span>
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
