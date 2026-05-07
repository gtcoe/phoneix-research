import { HBarChart } from "@/components/ui";

interface Bar {
  label: string;
  value: number;
  pct: number;
  color: string;
}

interface Props {
  bars: Bar[];
}

export default function SectorBars({ bars }: Props) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-4 px-5">
      <div className="text-sm font-semibold text-[var(--text)] mb-3.5">
        Sector Exposure
      </div>
      <HBarChart data={bars} height={16} />
    </div>
  );
}
