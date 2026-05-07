import { DonutChart } from "@/components/ui";

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface Props {
  segments: Segment[];
}

export default function AllocationDonut({ segments }: Props) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-4 px-5">
      <div className="text-sm font-semibold text-[var(--text)] mb-3.5">
        Allocation
      </div>
      <div className="flex flex-col items-center gap-3.5">
        <DonutChart segments={segments} size={160} strokeWidth={26} />
        <div className="flex flex-wrap gap-x-[14px] gap-y-1.5 justify-center">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center gap-[5px]">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: s.color }}
              />
              <span className="text-[11px] text-[var(--muted)]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
