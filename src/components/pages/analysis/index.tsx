"use client";
import { useState } from "react";
import type { PhoenixData } from "@/types";
import { TabBar } from "@/components/ui";
import { RebalanceTab } from "./RebalanceTab";
import { PerformanceTab } from "./PerformanceTab";
import { SectorTab } from "./SectorTab";
import { RiskTab } from "./RiskTab";
import { CorrelationTab } from "./CorrelationTab";
import { DrawdownTab } from "./DrawdownTab";
import { TimelineTab } from "./TimelineTab";
import { HoldingPeriodTab } from "./HoldingPeriodTab";

const TABS = [
  { id: "performance", label: "Performance" },
  { id: "sector", label: "Sector" },
  { id: "risk", label: "Risk" },
  { id: "correlation", label: "Correlation" },
  { id: "drawdown", label: "Drawdown" },
  { id: "rebalance", label: "Rebalance" },
  { id: "timeline", label: "Timeline" },
  { id: "holding", label: "Holding Period" },
];

export default function Analysis({ data }: { data: PhoenixData }) {
  const [tab, setTab] = useState("performance");
  return (
    <div style={{ padding: 24 }}>
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {tab === "performance" && <PerformanceTab data={data} />}
      {tab === "sector" && <SectorTab data={data} />}
      {tab === "risk" && <RiskTab data={data} />}
      {tab === "correlation" && <CorrelationTab data={data} />}
      {tab === "drawdown" && <DrawdownTab data={data} />}
      {tab === "rebalance" && <RebalanceTab data={data} />}
      {tab === "timeline" && <TimelineTab data={data} />}
      {tab === "holding" && <HoldingPeriodTab data={data} />}
    </div>
  );
}
