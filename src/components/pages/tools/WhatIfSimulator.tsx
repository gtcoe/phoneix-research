"use client";
import { THRESHOLDS } from "@/constants/thresholds";
import { useState } from "react";
import { fmt, fmtPct } from "@/lib/formatters";
import { calcXIRR, pd } from "@/lib/data";
import type { PhoenixData } from "@/lib/data";

export function WhatIfSimulator({ data }: { data: PhoenixData }) {
  const [selectedId, setSelectedId] = useState(
    String(data.assets.find((a) => a.qty != null)?.id ?? ""),
  );
  const [exitPrice, setExitPrice] = useState("");
  const [exitDate, setExitDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });

  const selected = data.assets.find(
    (a) => a.qty != null && a.entryDate != null && String(a.id) === selectedId,
  );

  const ep = parseFloat(exitPrice) || selected?.currentPrice || 0;
  const exitDateObj = new Date(exitDate);

  let simXIRR: number | null = null;
  let simGain: number | null = null;
  let simGainPct: number | null = null;

  if (selected && ep > 0 && selected.qty != null) {
    const invested = selected.invested;
    const currentVal = ep * selected.qty;
    simGain = currentVal - invested;
    simGainPct = invested > 0 ? (simGain / invested) * 100 : 0;

    const entryDateObj = pd(selected.entryDate) ?? new Date();
    const cfs = [
      { amount: -invested, date: entryDateObj },
      { amount: currentVal, date: exitDateObj },
    ];
    const origCFs = [
      { amount: -invested, date: entryDateObj },
      { amount: selected.current, date: new Date() },
    ];
    simXIRR = calcXIRR(cfs) ?? selected.xirr;
    const _origXIRR = calcXIRR(origCFs) ?? selected.xirr;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 16,
          }}
        >
          Scenario Inputs
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label
              style={{
                fontSize: 11,
                color: "var(--muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Select Stock
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text)",
                fontSize: 13,
              }}
            >
              {data.assets
                .filter((a) => a.qty != null && a.entryDate != null)
                .map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.ticker} — {a.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                color: "var(--muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Exit Price (₹)
            </label>
            <input
              type="number"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              placeholder={selected?.currentPrice?.toFixed(2)}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text)",
                fontSize: 13,
                fontFamily: "var(--font-mono)",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                color: "var(--muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Exit Date
            </label>
            <input
              type="date"
              value={exitDate}
              onChange={(e) => setExitDate(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text)",
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
        {selected && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
          >
            <div
              style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}
            >
              Current Position
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {[
                { label: "Invested", value: fmt(selected.invested) },
                { label: "Current", value: fmt(selected.current) },
                { label: "Qty", value: String(selected.qty) },
                { label: "Entry", value: fmt(selected.entryPrice) },
              ].map((m) => (
                <div key={m.label}>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 16,
          }}
        >
          Simulation Results
        </div>
        {selected && simXIRR !== null ? (
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "18px 20px",
            }}
          >
            {(
              [
              { label: "Exit Price", value: fmt(ep) },
              { label: "Exit Value", value: fmt(ep * (selected.qty ?? 0)) },
              {
                label: "Gain/Loss",
                value: simGain !== null ? fmt(simGain) : "—",
                color: (simGain ?? 0) >= 0 ? "var(--gain)" : "var(--loss)",
              },
              {
                label: "Return %",
                value: simGainPct !== null ? fmtPct(simGainPct) : "—",
                color: (simGainPct ?? 0) >= 0 ? "var(--gain)" : "var(--loss)",
              },
              {
                label: "Simulated XIRR",
                value: simXIRR !== null ? `${simXIRR.toFixed(1)}%` : "—",
                color:
                  simXIRR !== null && simXIRR >= 15
                    ? "var(--gain)"
                    : "var(--warn)",
              },
              {
                label: "Current XIRR",
                value:
                  selected.xirr != null ? `${selected.xirr.toFixed(1)}%` : "—",
                color:
                  (selected.xirr ?? 0) >= THRESHOLDS.GOOD_XIRR ? "var(--gain)" : "var(--warn)",
              },
            ] as Array<{ label: string; value: string; color?: string }>
            ).map((r) => (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "9px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--muted)" }}>
                  {r.label}
                </span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: r.color || "var(--text)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: 30,
              textAlign: "center",
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            Select a stock and set an exit scenario
          </div>
        )}
      </div>
    </div>
  );
}
