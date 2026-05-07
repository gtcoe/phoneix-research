"use client";
import { useState } from "react";
import { fmt } from "@/lib/formatters";
import type { PhoenixData } from "@/types";

export function RebalanceTab({ data }: { data: PhoenixData }) {
  const [targets, setTargets] = useState<Record<string, number>>(() => {
    const t: Record<string, number> = {};
    data.assets.forEach((a) => {
      t[a.id] = parseFloat(((a.current / data.netWorth) * 100).toFixed(1));
    });
    return t;
  });

  const totalTarget = Object.values(targets).reduce((s, v) => s + v, 0);
  const isBalanced = Math.abs(totalTarget - 100) < 0.1;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          Set target allocations. Total must equal 100%.
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            fontWeight: 700,
            color: isBalanced ? "var(--gain)" : "var(--loss)",
          }}
        >
          Total: {totalTarget.toFixed(1)}%
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.assets.map((a) => {
          const curPct = (a.current / data.netWorth) * 100;
          const targetPct = targets[a.id] || 0;
          const diff = targetPct - curPct;
          const diffAmt = (diff / 100) * data.netWorth;
          return (
            <div
              key={a.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 80px 90px 100px",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                background: "var(--surface)",
                borderRadius: 8,
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--text)",
                    fontFamily: "var(--font-mono)",
                    marginRight: 8,
                  }}
                >
                  {a.ticker}
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  {a.category}
                </span>
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontSize: 12,
                  color: "var(--muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {curPct.toFixed(1)}% now
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={targetPct}
                  onChange={(e) =>
                    setTargets((prev) => ({
                      ...prev,
                      [a.id]: parseFloat(e.target.value) || 0,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "4px 8px",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 5,
                    color: "var(--text)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                  }}
                />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>%</span>
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: diff >= 0 ? "var(--gain)" : "var(--loss)",
                }}
              >
                {diff >= 0 ? "+" : ""}
                {diff.toFixed(1)}%
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: diffAmt >= 0 ? "var(--gain)" : "var(--loss)",
                }}
              >
                {diffAmt >= 0 ? "Buy " : "Sell "}
                {fmt(Math.abs(diffAmt))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
