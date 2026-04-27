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
        Allocation
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <DonutChart segments={segments} size={160} strokeWidth={26} />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 14px",
            justifyContent: "center",
          }}
        >
          {segments.map((s) => (
            <div
              key={s.label}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: s.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
