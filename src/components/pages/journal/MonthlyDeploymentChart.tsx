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
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-4 px-5 mb-5">
      <div className="text-sm font-semibold text-[var(--text)] mb-3.5">
        Monthly Deployment
      </div>
      <div className="flex items-end gap-[6px] h-[60px]">
        {monthlyData.map(([label, val]) => (
          <div
            key={label}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <div
              title={`${label}: ${fmt(val)}`}
              className="w-full min-h-[2px] bg-[var(--accent)] rounded-t-[3px] opacity-[0.85] cursor-default transition-opacity duration-150"
              style={{ height: `${(val / maxMonthly) * 52}px` }}
            />
            <span className="text-[9px] text-[var(--muted)] font-[var(--font-mono)] whitespace-nowrap">
              {label.slice(5)}/{label.slice(2, 4)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
