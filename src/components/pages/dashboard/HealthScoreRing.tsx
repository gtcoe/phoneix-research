import { THRESHOLDS } from "@/constants/thresholds";
import type { PhoenixData } from "@/types";

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
    <div className="flex gap-6 items-center">
      <div className="relative shrink-0">
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
      <div className="flex-1 flex flex-col gap-1.5">
        {compRows.map((c) => {
          const c2 =
            c.value >= THRESHOLDS.GOOD_HEALTH_SCORE
              ? "var(--gain)"
              : c.value >= THRESHOLDS.FAIR_HEALTH_SCORE
                ? "var(--warn)"
                : "var(--loss)";
          return (
            <div key={c.label} className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--muted)] w-[90px]">
                {c.label}
              </span>
              <div className="flex-1 bg-[var(--border)] rounded-full h-[5px] overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-400"
                  style={{ width: `${c.value}%`, background: c2 }}
                />
              </div>
              <span
                className="text-[11px] w-7 text-right font-[var(--font-mono)]"
                style={{ color: c2 }}
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
