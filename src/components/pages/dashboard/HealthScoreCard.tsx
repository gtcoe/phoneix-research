import HealthScoreRing from "./HealthScoreRing";
import type { PhoenixData } from "@/types";

interface Props {
  score: number;
  components: PhoenixData["healthComponents"];
}

export default function HealthScoreCard({ score, components }: Props) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-4 px-5">
      <div className="text-sm font-semibold text-[var(--text)] mb-3.5">
        Portfolio Health
      </div>
      <HealthScoreRing score={score} components={components} />
    </div>
  );
}
