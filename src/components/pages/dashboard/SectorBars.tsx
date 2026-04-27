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
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "16px 20px",
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
        Sector Exposure
      </div>
      <HBarChart data={bars} height={16} />
    </div>
  );
}
