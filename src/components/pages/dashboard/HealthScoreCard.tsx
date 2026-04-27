import HealthScoreRing from "./HealthScoreRing";
import type { PhoenixData } from "@/lib/data";

interface Props {
  score: number;
  components: PhoenixData["healthComponents"];
}

export default function HealthScoreCard({ score, components }: Props) {
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
        Portfolio Health
      </div>
      <HealthScoreRing score={score} components={components} />
    </div>
  );
}
