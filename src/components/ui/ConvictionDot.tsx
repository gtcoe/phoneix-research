"use client";
import { THRESHOLDS } from "@/constants/thresholds";

export function ConvictionDot({ score }: { score: number | null }) {
  if (!score) return null;
  const color =
    score >= THRESHOLDS.HIGH_CONVICTION
      ? "var(--gain)"
      : score >= THRESHOLDS.MEDIUM_CONVICTION
        ? "var(--warn)"
        : "var(--muted)";
  return (
    <span
      className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[var(--surface2)] text-[11px] font-bold font-[var(--font-mono)]"
      style={{ color }}
    >
      {score}
    </span>
  );
}
