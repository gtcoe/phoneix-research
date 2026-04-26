"use client";
import type { PhoenixData } from "@/lib/data";

export function ExcessReturnsChart({ data }: { data: PhoenixData }) {
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
