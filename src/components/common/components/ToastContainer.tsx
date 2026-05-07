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
    <div className="fixed bottom-7 right-7 flex flex-col gap-2 z-[9999] pointer-events-none">
      {toasts.map((t) => {
        const s = TYPE_STYLES[t.type];
        return (
          <div
            key={t.id}
            className="flex items-center gap-[10px] text-white py-[10px] px-[18px] rounded-[10px] font-semibold text-sm"
            style={{
              background: s.bg,
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              animation: "toast-in 0.2s ease",
            }}
          >
            <span className="text-base">{s.icon}</span>
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
