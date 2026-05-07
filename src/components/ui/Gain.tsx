"use client";
import { fmt, fmtPct } from "@/lib/formatters";

export function Gain({
  value,
  pct,
  mono = true,
}: {
  value: number;
  pct?: number;
  mono?: boolean;
}) {
  const isPos = value >= 0;
  const color = isPos ? "var(--gain)" : "var(--loss)";
  return (
    <span
      className="inline-flex flex-col items-end gap-0.5"
      style={{ fontFamily: mono ? "var(--font-mono)" : "inherit" }}
    >
      <span
        className="font-bold text-[0.95em] leading-[1.2]"
        style={{ color }}
      >
        {isPos ? "+" : ""}
        {fmt(value)}
      </span>
      {pct !== undefined && (
        <span
          className="opacity-75 text-[0.78em] leading-[1.2]"
          style={{ color }}
        >
          {fmtPct(pct)}
        </span>
      )}
    </span>
  );
}
