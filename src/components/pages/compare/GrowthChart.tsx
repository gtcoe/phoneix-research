"use client";
import { useState, useRef } from "react";
import type { PhoenixData } from "@/lib/data";

export function GrowthChart({ data }: { data: PhoenixData }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 820,
    H = 240,
    padL = 56,
    padR = 20,
    padT = 16,
    padB = 36;
  const gW = W - padL - padR;
  const gH = H - padT - padB;
  const N = data.history.length;

  const portfolio = data.history.map((h) => h.value);
  const base = portfolio[0];

  const benchSeries = [
    {
      label: "Portfolio",
      color: "var(--accent)",
      values: portfolio.map((v) => ((v - base) / base) * 100),
    },
    {
      label: "Nifty 50",
      color: "#6366f1",
      values: data.benchmarks.nifty50.history.map(
        (v: { value: number }) =>
          ((v.value - data.benchmarks.nifty50.history[0].value) /
            data.benchmarks.nifty50.history[0].value) *
          100,
      ),
    },
    {
      label: "Midcap 150",
      color: "#f59e0b",
      values: data.benchmarks.midcap150.history.map(
        (v: { value: number }) =>
          ((v.value - data.benchmarks.midcap150.history[0].value) /
            data.benchmarks.midcap150.history[0].value) *
          100,
      ),
    },
    {
      label: "Fixed Deposit",
      color: "#10b981",
      values: data.benchmarks.fd.history.map(
        (v: { value: number }) =>
          ((v.value - data.benchmarks.fd.history[0].value) /
            data.benchmarks.fd.history[0].value) *
          100,
      ),
    },
  ];

  const allVals = benchSeries.flatMap((s) => s.values);
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals) * 1.05;
  const range = maxV - minV;

  const toX = (i: number) => padL + (i / (N - 1)) * gW;
  const toY = (v: number) => padT + gH - ((v - minV) / range) * gH;

  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = minV + (range * i) / yTicks;
    return { y: toY(v), label: `${v >= 0 ? "+" : ""}${v.toFixed(0)}%` };
  }).reverse();

  return (
    <>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", overflow: "visible" }}
        onMouseMove={(e) => {
          if (!svgRef.current) return;
          const rect = svgRef.current.getBoundingClientRect();
          const mx = (e.clientX - rect.left) * (W / rect.width) - padL;
          const idx = Math.round((mx / gW) * (N - 1));
          setHovered(Math.max(0, Math.min(N - 1, idx)));
        }}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Grid */}
        {yLabels.map((l, i) => (
          <g key={i}>
            <line
              x1={padL}
              y1={l.y}
              x2={padL + gW}
              y2={l.y}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="3,4"
            />
            <text
              x={padL - 6}
              y={l.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="var(--muted)"
              fontFamily="var(--font-mono)"
            >
              {l.label}
            </text>
          </g>
        ))}
        {data.history
          .filter((_, i) => i % 3 === 0 || i === N - 1)
          .map((h) => {
            const idx = data.history.indexOf(h);
            return (
              <text
                key={idx}
                x={toX(idx)}
                y={padT + gH + 20}
                textAnchor="middle"
                fontSize="10"
                fill="var(--muted)"
                fontFamily="var(--font-mono)"
              >
                {h.date}
              </text>
            );
          })}
        {/* Zero line */}
        <line
          x1={padL}
          y1={toY(0)}
          x2={padL + gW}
          y2={toY(0)}
          stroke="var(--border)"
          strokeWidth="1"
        />
        {/* Series */}
        {benchSeries.map((s) => {
          const pts = s.values
            .map(
              (v, i) =>
                `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`,
            )
            .join(" ");
          return (
            <path
              key={s.label}
              d={pts}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
        {/* Hover line */}
        {hovered !== null && (
          <>
            <line
              x1={toX(hovered)}
              y1={padT}
              x2={toX(hovered)}
              y2={padT + gH}
              stroke="var(--muted)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            {benchSeries.map((s) => (
              <circle
                key={s.label}
                cx={toX(hovered)}
                cy={toY(s.values[hovered])}
                r="4"
                fill={s.color}
                stroke="var(--surface)"
                strokeWidth="2"
              />
            ))}
            <g
              transform={`translate(${Math.min(toX(hovered) + 10, W - 160)},${padT})`}
            >
              <rect
                x="0"
                y="0"
                width="150"
                height={benchSeries.length * 22 + 24}
                rx="6"
                fill="var(--surface2)"
                stroke="var(--border)"
                strokeWidth="1"
              />
              <text
                x="8"
                y="16"
                fontSize="10"
                fill="var(--muted)"
                fontFamily="var(--font-mono)"
              >
                {data.history[hovered].date}
              </text>
              {benchSeries.map((s, i) => (
                <text
                  key={s.label}
                  x="8"
                  y={32 + i * 22}
                  fontSize="11"
                  fill={s.color}
                  fontFamily="var(--font-mono)"
                >
                  {s.label}: {s.values[hovered] >= 0 ? "+" : ""}
                  {s.values[hovered].toFixed(1)}%
                </text>
              ))}
            </g>
          </>
        )}
      </svg>
      {/* Legend */}
      <div
        style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 12 }}
      >
        {benchSeries.map((s) => (
          <div
            key={s.label}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <span
              style={{
                width: 20,
                height: 3,
                borderRadius: 99,
                background: s.color,
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
