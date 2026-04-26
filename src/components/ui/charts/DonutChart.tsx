"use client";
import { useState } from "react";
import { fmt } from "@/lib/formatters";

export function DonutChart({
  segments,
  size = 180,
  strokeWidth = 28,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
  size?: number;
  strokeWidth?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2,
    cy = size / 2;
  let offset = 0;
  const total = segments.reduce((s, sg) => s + sg.value, 0);
  const slices = segments.map((sg, i) => {
    const pct = sg.value / total;
    const dash = pct * circ;
    const gap = circ - dash;
    const slice = { ...sg, pct, dash, gap, offset, i };
    offset += dash;
    return slice;
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block" }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
      />
      {slices.map((sl, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={sl.color}
          strokeWidth={active === i ? strokeWidth + 4 : strokeWidth}
          strokeDasharray={`${sl.dash - 2} ${sl.gap + 2}`}
          strokeDashoffset={circ / 4 - sl.offset}
          style={{
            cursor: "pointer",
            transition: "stroke-width .15s",
            transform: "rotate(-90deg)",
            transformOrigin: `${cx}px ${cy}px`,
          }}
          onMouseEnter={() => setActive(i)}
          onMouseLeave={() => setActive(null)}
        />
      ))}
      {active !== null ? (
        <>
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fontSize="11"
            fill="var(--muted)"
            fontFamily="var(--font-mono)"
          >
            {slices[active].label}
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            fontSize="14"
            fontWeight="700"
            fill="var(--text)"
            fontFamily="var(--font-mono)"
          >
            {(slices[active].pct * 100).toFixed(1)}%
          </text>
        </>
      ) : (
        <>
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            fontSize="10"
            fill="var(--muted)"
          >
            Net Worth
          </text>
          <text
            x={cx}
            y={cy + 13}
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="var(--text)"
            fontFamily="var(--font-mono)"
          >
            {fmt(total)}
          </text>
        </>
      )}
    </svg>
  );
}
