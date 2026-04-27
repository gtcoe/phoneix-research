import type { ConvictionAlert } from "@/types/alert";

export const convictionAlertsData: ConvictionAlert[] = [
  {
    id: "ca1",
    ticker: "WEBELSOLAR",
    name: "Websol Energy",
    severity: "high",
    type: "thesis_risk",
    message:
      "Stock is -7.1% from entry. Chinese module dumping risk elevated. Review thesis validity.",
    date: "Apr 20 2026",
    read: false,
  },
  {
    id: "ca2",
    ticker: "INDOTECH",
    name: "Indo Tech Trans.",
    severity: "high",
    type: "governance",
    message:
      "Promoter pledge still at 77%. No reduction in 2 quarters. Red flag unresolved.",
    date: "Apr 18 2026",
    read: false,
  },
  {
    id: "ca3",
    ticker: "RBZJEWEL",
    name: "RBZ Jewellers",
    severity: "medium",
    type: "guidance_cut",
    message:
      "Guidance cut for 3rd consecutive quarter. B2B→B2C transition slower than expected.",
    date: "Apr 15 2026",
    read: true,
  },
  {
    id: "ca4",
    ticker: "CELLECOR",
    name: "Cellecor Gadgets",
    severity: "medium",
    type: "margin_stagnant",
    message:
      "PAT margins at 3.1% — unchanged for 4th year. Thesis requires margin expansion proof.",
    date: "Apr 10 2026",
    read: true,
  },
  {
    id: "ca5",
    ticker: "DEEDEV",
    name: "DEE Development",
    severity: "low",
    type: "positive",
    message:
      "Q4 FY26 order book up 34% QoQ. Nuclear order pipeline firming up. Thesis intact ✓",
    date: "Apr 22 2026",
    read: false,
  },
  {
    id: "ca6",
    ticker: "SKYGOLD",
    name: "Sky Gold",
    severity: "low",
    type: "positive",
    message:
      "FY26 revenue guidance reiterated. Malabar Gold expansion creates new volume visibility.",
    date: "Apr 19 2026",
    read: true,
  },
];
