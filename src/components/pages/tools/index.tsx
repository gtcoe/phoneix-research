"use client";
import { useState } from "react";
import { TabBar } from "@/components/ui";
import type { PhoenixData } from "@/lib/data";
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
    <div style={{ padding: 24 }}>
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "20px 22px",
        }}
      >
        {tab === "target" && <TargetPriceCalc data={data} />}
        {tab === "whatif" && <WhatIfSimulator data={data} />}
        {tab === "import" && <CSVImport />}
        {tab === "export" && <ExportPDF data={data} />}
        {tab === "taxpl" && <TaxPL data={data} />}
        {tab === "goals" && <GoalPlanning data={data} />}
      </div>
    </div>
  );
}
