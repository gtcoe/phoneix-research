// @ts-nocheck
"use client";
import { useState, useRef } from "react";
import { fmt, fmtPct, Gain, TabBar } from "./ui";
import type { PhoenixData } from "@/lib/data";

const TABS = [
  { id: "growth", label: "Cumulative Growth" },
  { id: "excess", label: "Monthly Excess Returns" },
  { id: "alpha", label: "Holding Alpha" },
];

// ─── Growth chart: multi-line SVG ─────────────────────────────────────────────
function GrowthChart({ data }: { data: PhoenixData }) {
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
          .map((h, _, arr) => {
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

// ─── Excess returns bar chart ─────────────────────────────────────────────────
function ExcessReturnsChart({ data }: { data: PhoenixData }) {
  const W = 820,
    H = 180,
    padL = 50,
    padR = 20,
    padT = 16,
    padB = 30;
  const gW = W - padL - padR,
    gH = H - padT - padB;
  const hist = data.history;
  const ni50 = data.benchmarks.nifty50.history;

  const excessData = hist.slice(1).map((h, i) => {
    const portRet = ((h.value - hist[i].value) / hist[i].value) * 100;
    const benchRet =
      ((ni50[i + 1].value - ni50[i].value) / ni50[i].value) * 100;
    return { date: h.date, excess: portRet - benchRet };
  });

  const maxAbs = Math.max(...excessData.map((d) => Math.abs(d.excess)), 1);
  const bW = (gW / excessData.length) * 0.7;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {/* Zero line */}
      <line
        x1={padL}
        y1={padT + gH / 2}
        x2={padL + gW}
        y2={padT + gH / 2}
        stroke="var(--border)"
        strokeWidth="1"
      />
      {excessData.map((d, i) => {
        const x =
          padL +
          (i / excessData.length) * gW +
          (gW / excessData.length - bW) / 2;
        const barH = (Math.abs(d.excess) / maxAbs) * (gH / 2);
        const y = d.excess >= 0 ? padT + gH / 2 - barH : padT + gH / 2;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={bW}
              height={barH}
              fill={d.excess >= 0 ? "var(--gain)" : "var(--loss)"}
              rx="2"
              opacity="0.8"
            />
            {i % 3 === 0 && (
              <text
                x={x + bW / 2}
                y={padT + gH + 18}
                textAnchor="middle"
                fontSize="9"
                fill="var(--muted)"
                fontFamily="var(--font-mono)"
              >
                {d.date}
              </text>
            )}
          </g>
        );
      })}
      <text
        x={padL - 6}
        y={padT + 4}
        textAnchor="end"
        fontSize="9"
        fill="var(--muted)"
        fontFamily="var(--font-mono)"
      >
        +{maxAbs.toFixed(0)}%
      </text>
      <text
        x={padL - 6}
        y={padT + gH}
        textAnchor="end"
        fontSize="9"
        fill="var(--muted)"
        fontFamily="var(--font-mono)"
      >
        -{maxAbs.toFixed(0)}%
      </text>
    </svg>
  );
}

// ─── Compare component ─────────────────────────────────────────────────────────
export default function Compare({ data }: { data: PhoenixData }) {
  const [tab, setTab] = useState("growth");

  const alphaRows = data.assets
    .map((a) => ({
      ...a,
      alpha: (a.xirr ?? 0) - data.benchmarks.nifty50.xirr,
    }))
    .sort((a, b) => b.alpha - a.alpha);

  return (
    <div style={{ padding: 24 }}>
      {/* Summary bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Portfolio XIRR",
            value: `${data.xirr.toFixed(1)}%`,
            color: "var(--accent)",
          },
          {
            label: "vs Nifty 50",
            value: `${data.benchmarks.nifty50.xirr.toFixed(1)}%`,
            sub: `α +${data.alpha.toFixed(1)}%`,
            color: "#6366f1",
          },
          {
            label: "vs Midcap 150",
            value: `${data.benchmarks.midcap150.xirr.toFixed(1)}%`,
            sub: `α +${(data.xirr - data.benchmarks.midcap150.xirr).toFixed(1)}%`,
            color: "#f59e0b",
          },
          {
            label: "vs FD",
            value: `${data.benchmarks.fd.xirr.toFixed(1)}%`,
            sub: `α +${(data.xirr - data.benchmarks.fd.xirr).toFixed(1)}%`,
            color: "#10b981",
          },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "12px 16px",
            }}
          >
            <div
              style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}
            >
              {c.label}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: c.color,
                fontFamily: "var(--font-mono)",
              }}
            >
              {c.value}
            </div>
            {c.sub && (
              <div style={{ fontSize: 12, color: "var(--gain)", marginTop: 3 }}>
                {c.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {tab === "growth" && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 16,
            }}
          >
            Cumulative Growth (normalised to 100)
          </div>
          <GrowthChart data={data} />
        </div>
      )}

      {tab === "excess" && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 16,
            }}
          >
            Monthly Excess Returns vs Nifty 50
          </div>
          <ExcessReturnsChart data={data} />
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 14,
                  height: 10,
                  background: "var(--gain)",
                  borderRadius: 2,
                  opacity: 0.8,
                }}
              />
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                Outperformed
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 14,
                  height: 10,
                  background: "var(--loss)",
                  borderRadius: 2,
                  opacity: 0.8,
                }}
              />
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                Underperformed
              </span>
            </div>
          </div>
        </div>
      )}

      {tab === "alpha" && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 16,
            }}
          >
            Holding-Level Alpha vs Nifty 50
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alphaRows.map((a) => {
              const w = Math.min(100, (Math.abs(a.alpha) / 30) * 100);
              return (
                <div
                  key={a.id}
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <div
                    style={{
                      width: 64,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text)",
                      fontFamily: "var(--font-mono)",
                      textAlign: "right",
                    }}
                  >
                    {a.ticker}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      height: 22,
                    }}
                  >
                    <div
                      style={{
                        width: "50%",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      {a.alpha < 0 && (
                        <div
                          style={{
                            width: `${w}%`,
                            height: "100%",
                            background: "var(--loss)",
                            borderRadius: "4px 0 0 4px",
                            opacity: 0.7,
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        width: 1,
                        height: "100%",
                        background: "var(--border)",
                      }}
                    />
                    <div style={{ width: "50%" }}>
                      {a.alpha >= 0 && (
                        <div
                          style={{
                            width: `${w}%`,
                            height: "100%",
                            background: "var(--gain)",
                            borderRadius: "0 4px 4px 0",
                            opacity: 0.7,
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 60,
                      textAlign: "right",
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      color: a.alpha >= 0 ? "var(--gain)" : "var(--loss)",
                    }}
                  >
                    {a.alpha >= 0 ? "+" : ""}
                    {a.alpha.toFixed(1)}%
                  </div>
                  <div
                    style={{
                      width: 48,
                      textAlign: "right",
                      fontSize: 11,
                      color: "var(--muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {a.xirr != null ? `${a.xirr.toFixed(1)}% p` : "—"}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 20,
              padding: "12px 16px",
              background: "var(--surface)",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: 6,
              }}
            >
              Portfolio Summary
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Outperformers:{" "}
                <span style={{ color: "var(--gain)", fontWeight: 600 }}>
                  {alphaRows.filter((a) => a.alpha > 0).length}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Underperformers:{" "}
                <span style={{ color: "var(--loss)", fontWeight: 600 }}>
                  {alphaRows.filter((a) => a.alpha <= 0).length}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Avg alpha:{" "}
                <span
                  style={{
                    color: "var(--accent)",
                    fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  +{data.alpha.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
