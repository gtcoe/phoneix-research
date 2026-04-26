"use client";
import { useState } from "react";
import { TabBar } from "@/components/ui";
import type { PhoenixData } from "@/lib/data";
import { GrowthChart } from "./GrowthChart";
import { ExcessReturnsChart } from "./BenchmarkTable";
import { AlphaTable } from "./AlphaTable";

const TABS = [
  { id: "growth", label: "Cumulative Growth" },
  { id: "excess", label: "Monthly Excess Returns" },
  { id: "alpha", label: "Holding Alpha" },
];

export default function Compare({ data }: { data: PhoenixData }) {
  const [tab, setTab] = useState("growth");

  return (
    <div style={{ padding: 24 }}>
      {/* Summary bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Portfolio XIRR",
            value: `${data.xirr.toFixed(1)}%`,
            color: "var(--accent)",
          },
          {
            label: "vs Nifty 50",
            value: `${data.benchmarks.nifty50.xirr.toFixed(1)}%`,
            sub: `α +${data.alpha.toFixed(1)}%`,
            color: "#6366f1",
          },
          {
            label: "vs Midcap 150",
            value: `${data.benchmarks.midcap150.xirr.toFixed(1)}%`,
            sub: `α +${(data.xirr - data.benchmarks.midcap150.xirr).toFixed(1)}%`,
            color: "#f59e0b",
          },
          {
            label: "vs FD",
            value: `${data.benchmarks.fd.xirr.toFixed(1)}%`,
            sub: `α +${(data.xirr - data.benchmarks.fd.xirr).toFixed(1)}%`,
            color: "#10b981",
          },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "12px 16px",
            }}
          >
            <div
              style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}
            >
              {c.label}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: c.color,
                fontFamily: "var(--font-mono)",
              }}
            >
              {c.value}
            </div>
            {c.sub && (
              <div style={{ fontSize: 12, color: "var(--gain)", marginTop: 3 }}>
                {c.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {tab === "growth" && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 16,
            }}
          >
            Cumulative Growth (normalised to 100)
          </div>
          <GrowthChart data={data} />
        </div>
      )}

      {tab === "excess" && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 16,
            }}
          >
            Monthly Excess Returns vs Nifty 50
          </div>
          <ExcessReturnsChart data={data} />
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 14,
                  height: 10,
                  background: "var(--gain)",
                  borderRadius: 2,
                  opacity: 0.8,
                }}
              />
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                Outperformed
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 14,
                  height: 10,
                  background: "var(--loss)",
                  borderRadius: 2,
                  opacity: 0.8,
                }}
              />
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                Underperformed
              </span>
            </div>
          </div>
        </div>
      )}

      {tab === "alpha" && <AlphaTable data={data} />}
    </div>
  );
}
