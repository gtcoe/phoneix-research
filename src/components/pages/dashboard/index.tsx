"use client";
import { useMemo } from "react";
import { SECTOR_COLORS, CATEGORY_COLORS } from "@/constants/colors";
import type { PhoenixData } from "@/types";
import NetWorthHero from "./NetWorthHero";
import AllocationDonut from "./AllocationDonut";
import SectorBars from "./SectorBars";
import HealthScoreCard from "./HealthScoreCard";
import TopHoldings from "./TopHoldings";
import ConvictionAlertsCard from "./ConvictionAlertsCard";
import RecentReports from "./RecentReports";

export default function Dashboard({ data }: { data: PhoenixData }) {
  const { catSegments, sectorBars } = useMemo(() => {
    const sectorMap: Record<string, number> = {};
    const catMap: Record<string, number> = {};
    data.assets.forEach((a) => {
      sectorMap[a.sector] = (sectorMap[a.sector] || 0) + a.current;
      catMap[a.category] = (catMap[a.category] || 0) + a.current;
    });

    return {
      catSegments: Object.entries(catMap).map(([label, value]) => ({
        label,
        value,
        color: CATEGORY_COLORS[label] || "var(--muted)",
      })),
      sectorBars: Object.entries(sectorMap)
        .sort(([, a], [, b]) => b - a)
        .map(([label, value]) => ({
          label,
          value,
          pct: (value / data.netWorth) * 100,
          color: SECTOR_COLORS[label],
        })),
    };
  }, [data.assets, data.netWorth]);

  return (
    <div className="p-6 flex flex-col gap-5">
      <NetWorthHero data={data} />

      {/* Mid-row: donut + sector bars + health */}
      <div className="grid grid-cols-3 gap-4">
        <AllocationDonut segments={catSegments} />
        <SectorBars bars={sectorBars} />
        <HealthScoreCard
          score={data.healthScore}
          components={data.healthComponents}
        />
      </div>

      {/* Top holdings + conviction alerts */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
        <TopHoldings assets={data.assets} />
        <ConvictionAlertsCard alerts={data.convictionAlerts} />
      </div>

      <RecentReports reports={data.reports} />
    </div>
  );
}
