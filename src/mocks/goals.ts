import type { Goal } from "@/types/goal";

/** Factory — goals that reference live netWorth are injected at assembly time. */
export function buildGoals(netWorth: number): Goal[] {
  return [
    {
      id: "g1",
      name: "Financial Independence",
      targetAmount: 20000000,
      targetYear: 2035,
      currentAmount: netWorth,
      monthlyAddition: 50000,
      icon: "🏔️",
      color: "var(--accent)",
    },
    {
      id: "g2",
      name: "Dream Home Down Payment",
      targetAmount: 5000000,
      targetYear: 2028,
      currentAmount: netWorth * 0.18,
      monthlyAddition: 25000,
      icon: "🏠",
      color: "oklch(0.64 0.14 248)",
    },
    {
      id: "g3",
      name: "Child Education Fund",
      targetAmount: 3000000,
      targetYear: 2032,
      currentAmount: 169000 + 150000,
      monthlyAddition: 15000,
      icon: "🎓",
      color: "oklch(0.62 0.14 160)",
    },
  ];
}
