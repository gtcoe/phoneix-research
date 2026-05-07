"use client";
import { useState } from "react";
import { TabBar } from "@/components/ui";
import type { PhoenixData } from "@/types";
import { ErrorBoundary } from "@/components/common/components/ErrorBoundary";
import { TargetPriceCalc } from "./TargetPriceCalc";
import { WhatIfSimulator } from "./WhatIfSimulator";
import { CSVImport } from "./CSVImport";
import { TaxPL } from "./TaxPL";
import { GoalPlanning } from "./GoalPlanning";
import { ExportPDF } from "./ExportPDF";

const TABS = [
  { id: "target", label: "Target Price" },
  { id: "whatif", label: "What-If" },
  { id: "import", label: "CSV Import" },
  { id: "export", label: "Export PDF" },
  { id: "taxpl", label: "Tax & P/L" },
  { id: "goals", label: "Goal Planning" },
];

export default function Tools({ data }: { data: PhoenixData }) {
  const [tab, setTab] = useState("target");

  return (
    <div className="p-6">
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-5 px-[22px]">
        {/* key=tab resets the ErrorBoundary on every tab switch so one tool crash doesn't affect others */}
        <ErrorBoundary key={tab} pageName={TABS.find((t) => t.id === tab)?.label}>
          {tab === "target" && <TargetPriceCalc data={data} />}
          {tab === "whatif" && <WhatIfSimulator data={data} />}
          {tab === "import" && <CSVImport />}
          {tab === "export" && <ExportPDF data={data} />}
          {tab === "taxpl" && <TaxPL data={data} />}
          {tab === "goals" && <GoalPlanning data={data} />}
        </ErrorBoundary>
      </div>
    </div>
  );
}
