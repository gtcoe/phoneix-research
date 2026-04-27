import { fmt } from "@/lib/formatters";

interface Props {
  monthlyData: [string, number][];
  maxMonthly: number;
}

export default function MonthlyDeploymentChart({
  monthlyData,
  maxMonthly,
}: Props) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: 14,
        }}
      >
        Monthly Deployment
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          height: 60,
        }}
      >
        {monthlyData.map(([label, val]) => (
          <div
            key={label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              title={`${label}: ${fmt(val)}`}
              style={{
                width: "100%",
                height: `${(val / maxMonthly) * 52}px`,
                minHeight: 2,
                background: "var(--accent)",
                borderRadius: "3px 3px 0 0",
                opacity: 0.85,
                cursor: "default",
                transition: "opacity .15s",
              }}
            />
            <span
              style={{
                fontSize: 9,
                color: "var(--muted)",
                fontFamily: "var(--font-mono)",
                whiteSpace: "nowrap",
              }}
            >
              {label.slice(5)}/{label.slice(2, 4)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
