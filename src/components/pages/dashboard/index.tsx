"use client";
import { SECTOR_COLORS, CATEGORY_COLORS } from "@/constants/colors";
import type { PhoenixData } from "@/lib/data";
import NetWorthHero from "./NetWorthHero";
import AllocationDonut from "./AllocationDonut";
import SectorBars from "./SectorBars";
import HealthScoreCard from "./HealthScoreCard";
import TopHoldings from "./TopHoldings";
import ConvictionAlertsCard from "./ConvictionAlertsCard";
import RecentReports from "./RecentReports";

export default function Dashboard({ data }: { data: PhoenixData }) {
  const sectorMap: Record<string, number> = {};
  data.assets.forEach((a) => {
    sectorMap[a.sector] = (sectorMap[a.sector] || 0) + a.current;
  });

  const catMap: Record<string, number> = {};
  data.assets.forEach((a) => {
    catMap[a.category] = (catMap[a.category] || 0) + a.current;
  });

  const catSegments = Object.entries(catMap).map(([label, value]) => ({
    label,
    value,
    color: CATEGORY_COLORS[label] || "var(--muted)",
  }));

  const sectorBars = Object.entries(sectorMap)
    .sort(([, a], [, b]) => b - a)
    .map(([label, value]) => ({
      label,
      value,
      pct: (value / data.netWorth) * 100,
      color: SECTOR_COLORS[label],
    }));

  return (
    <div
      style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}
    >
      <NetWorthHero data={data} />

      {/* Mid-row: donut + sector bars + health */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}
      >
        <AllocationDonut segments={catSegments} />
        <SectorBars bars={sectorBars} />
        <HealthScoreCard
          score={data.healthScore}
          components={data.healthComponents}
        />
      </div>

      {/* Top holdings + conviction alerts */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}
      >
        <TopHoldings assets={data.assets} />
        <ConvictionAlertsCard alerts={data.convictionAlerts} />
      </div>

      <RecentReports reports={data.reports} />
    </div>
  );
}
