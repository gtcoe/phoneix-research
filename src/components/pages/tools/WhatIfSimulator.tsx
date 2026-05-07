"use client";
import { THRESHOLDS } from "@/constants/thresholds";
import { useState } from "react";
import { fmt, fmtPct } from "@/lib/formatters";
import { calcXIRR, pd } from "@/lib/data";
import type { PhoenixData } from "@/types";

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
    <div className="grid grid-cols-2 gap-5">
      <div>
        <div className="text-sm font-semibold text-[var(--text)] mb-4">
          Scenario Inputs
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] text-[var(--muted)] block mb-1">
              Select Stock
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full py-2 px-[10px] bg-[var(--bg)] border border-[var(--border)] rounded-md text-[var(--text)] text-sm"
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
            <label className="text-[11px] text-[var(--muted)] block mb-1">
              Exit Price (₹)
            </label>
            <input
              type="number"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              placeholder={selected?.currentPrice?.toFixed(2)}
              className="w-full py-2 px-[10px] bg-[var(--bg)] border border-[var(--border)] rounded-md text-[var(--text)] text-sm font-[var(--font-mono)] box-border"
            />
          </div>
          <div>
            <label className="text-[11px] text-[var(--muted)] block mb-1">
              Exit Date
            </label>
            <input
              type="date"
              value={exitDate}
              onChange={(e) => setExitDate(e.target.value)}
              className="w-full py-2 px-[10px] bg-[var(--bg)] border border-[var(--border)] rounded-md text-[var(--text)] text-sm box-border"
            />
          </div>
        </div>
        {selected && (
          <div className="mt-4 py-3 px-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
            <div className="text-[11px] text-[var(--muted)] mb-2">
              Current Position
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Invested", value: fmt(selected.invested) },
                { label: "Current", value: fmt(selected.current) },
                { label: "Qty", value: String(selected.qty) },
                { label: "Entry", value: fmt(selected.entryPrice) },
              ].map((m) => (
                <div key={m.label}>
                  <div className="text-[10px] text-[var(--muted)]">
                    {m.label}
                  </div>
                  <div className="text-sm font-semibold text-[var(--text)] font-[var(--font-mono)]">
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <div className="text-sm font-semibold text-[var(--text)] mb-4">
          Simulation Results
        </div>
        {selected && simXIRR !== null ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[10px] py-[18px] px-5">
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
                className="flex justify-between py-[9px] border-b border-[var(--border)]"
              >
                <span className="text-sm text-[var(--muted)]">
                  {r.label}
                </span>
                <span
                  className="text-base font-bold font-[var(--font-mono)]"
                  style={{ color: r.color || "var(--text)" }}
                >
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-[30px] text-center text-[var(--muted)] text-sm">
            Select a stock and set an exit scenario
          </div>
        )}
      </div>
    </div>
  );
}
