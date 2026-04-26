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
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 2,
        fontFamily: mono ? "var(--font-mono)" : "inherit",
      }}
    >
      <span
        style={{ color, fontWeight: 700, fontSize: "0.95em", lineHeight: 1.2 }}
      >
        {isPos ? "+" : ""}
        {fmt(value)}
      </span>
      {pct !== undefined && (
        <span
          style={{ color, opacity: 0.75, fontSize: "0.78em", lineHeight: 1.2 }}
        >
          {fmtPct(pct)}
        </span>
      )}
    </span>
  );
}
