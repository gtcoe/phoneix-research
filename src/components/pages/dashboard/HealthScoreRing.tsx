import { THRESHOLDS } from "@/constants/thresholds";
import type { PhoenixData } from "@/lib/data";

interface Props {
  score: number;
  components: PhoenixData["healthComponents"];
}

export default function HealthScoreRing({ score, components }: Props) {
  const SIZE = 120,
    SW = 12;
  const r = (SIZE - SW) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color =
    score >= THRESHOLDS.GOOD_HEALTH_SCORE
      ? "var(--gain)"
      : score >= THRESHOLDS.FAIR_HEALTH_SCORE
        ? "var(--warn)"
        : "var(--loss)";
  const cx = SIZE / 2,
    cy = SIZE / 2;

  const compRows = [
    { label: "XIRR", value: components.xirrScore },
    { label: "Alpha", value: components.alphaScore },
    { label: "Conviction", value: components.convScore },
    { label: "Diversification", value: components.diversScore },
    { label: "Drawdown", value: components.drawScore },
  ];

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={SW}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={SW}
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeDashoffset={circ / 4}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: `${cx}px ${cy}px`,
            }}
          />
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            fontSize="22"
            fontWeight="800"
            fill={color}
            fontFamily="var(--font-mono)"
          >
            {score}
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            fontSize="9"
            fill="var(--muted)"
            letterSpacing=".06em"
          >
            HEALTH
          </text>
        </svg>
      </div>
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}
      >
        {compRows.map((c) => {
          const c2 =
            c.value >= THRESHOLDS.GOOD_HEALTH_SCORE
              ? "var(--gain)"
              : c.value >= THRESHOLDS.FAIR_HEALTH_SCORE
                ? "var(--warn)"
                : "var(--loss)";
          return (
            <div
              key={c.label}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span style={{ fontSize: 11, color: "var(--muted)", width: 90 }}>
                {c.label}
              </span>
              <div
                style={{
                  flex: 1,
                  background: "var(--border)",
                  borderRadius: 99,
                  height: 5,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${c.value}%`,
                    height: "100%",
                    background: c2,
                    borderRadius: 99,
                    transition: "width .4s ease",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: c2,
                  width: 28,
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {c.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
