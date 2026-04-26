"use client";
import { useState, useRef } from "react";
import { fmt } from "@/lib/formatters";

export function AreaChart({
  data,
  width = 600,
  height = 200,
  color = "var(--accent)",
  labelKey = "date",
  valueKey = "value",
}: {
  data: Array<Record<string, any>>;
  width?: number;
  height?: number;
  color?: string;
  labelKey?: string;
  valueKey?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const padL = 48,
    padR = 16,
    padT = 12,
    padB = 32;
  const W = width - padL - padR;
  const H = height - padT - padB;
  const vals = data.map((d) => d[valueKey] as number);
  const min = Math.min(...vals) * 0.97;
  const max = Math.max(...vals) * 1.01;
  const range = max - min;
  const toX = (i: number) => padL + (i / (data.length - 1)) * W;
  const toY = (v: number) => padT + H - ((v - min) / range) * H;
  const pts = data.map((d, i) => [toX(i), toY(d[valueKey])]);
  const linePath = pts
    .map(
      (p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`,
    )
    .join(" ");
  const areaPath =
    linePath +
    ` L${pts[pts.length - 1][0].toFixed(1)},${(padT + H).toFixed(1)} L${padL},${(padT + H).toFixed(1)} Z`;
  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = min + (range * i) / yTicks;
    return { y: toY(v), label: fmt(v) };
  }).reverse();
  const xLabels = data.filter((_, i) => i % 3 === 0 || i === data.length - 1);

  return (
    <svg
      ref={svgRef}
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", overflow: "visible" }}
      onMouseMove={(e) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left - padL;
        const idx = Math.round((mx / W) * (data.length - 1));
        setHovered(Math.max(0, Math.min(data.length - 1, idx)));
      }}
      onMouseLeave={() => setHovered(null)}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {yLabels.map((t, i) => (
        <g key={i}>
          <line
            x1={padL}
            y1={t.y}
            x2={padL + W}
            y2={t.y}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="3,4"
          />
          <text
            x={padL - 6}
            y={t.y + 4}
            textAnchor="end"
            fontSize="10"
            fill="var(--muted)"
            fontFamily="var(--font-mono)"
          >
            {t.label}
          </text>
        </g>
      ))}
      {xLabels.map((d, i) => {
        const idx = data.indexOf(d);
        return (
          <text
            key={i}
            x={toX(idx)}
            y={padT + H + 20}
            textAnchor="middle"
            fontSize="10"
            fill="var(--muted)"
            fontFamily="var(--font-mono)"
          >
            {d[labelKey]}
          </text>
        );
      })}
      <path d={areaPath} fill="url(#areaGrad)" />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {hovered !== null && (
        <>
          <line
            x1={pts[hovered][0]}
            y1={padT}
            x2={pts[hovered][0]}
            y2={padT + H}
            stroke="var(--muted)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <circle
            cx={pts[hovered][0]}
            cy={pts[hovered][1]}
            r="4"
            fill={color}
            stroke="var(--surface)"
            strokeWidth="2"
          />
          <g
            transform={`translate(${Math.min(pts[hovered][0] + 8, width - 90)},${Math.max(pts[hovered][1] - 36, padT)})`}
          >
            <rect
              x="0"
              y="0"
              width="86"
              height="30"
              rx="5"
              fill="var(--surface2)"
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text
              x="8"
              y="12"
              fontSize="9"
              fill="var(--muted)"
              fontFamily="var(--font-mono)"
            >
              {data[hovered][labelKey]}
            </text>
            <text
              x="8"
              y="24"
              fontSize="11"
              fill="var(--text)"
              fontWeight="600"
              fontFamily="var(--font-mono)"
            >
              {fmt(data[hovered][valueKey])}
            </text>
          </g>
        </>
      )}
    </svg>
  );
}
