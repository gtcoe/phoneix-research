"use client";
import { useState } from "react";
import { fmt } from "@/lib/formatters";
import type { PhoenixData } from "@/types";

export function TargetPriceCalc({ data }: { data: PhoenixData }) {
  const [ticker, setTicker] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [eps, setEps] = useState("");
  const [growthRate, setGrowthRate] = useState("");
  const [peTarget, setPeTarget] = useState("");
  const [years, setYears] = useState("3");

  const selected = data.assets.find(
    (a) => a.ticker?.toLowerCase() === ticker.toLowerCase(),
  );
  const cp = parseFloat(currentPrice) || selected?.currentPrice || 0;
  const epsV = parseFloat(eps);
  const peT = parseFloat(peTarget) || 25;
  const gr = parseFloat(growthRate) / 100;
  const yr = parseInt(years) || 3;

  const futureEPS = epsV ? epsV * Math.pow(1 + gr, yr) : undefined;
  const intrinsicTarget = futureEPS ? futureEPS * peT : undefined;
  const upside =
    intrinsicTarget && cp ? ((intrinsicTarget - cp) / cp) * 100 : undefined;
  const selectedTarget = selected?.targetPrice;
  const currentTarget = selectedTarget
    ? { target: selectedTarget, upside: ((selectedTarget - cp) / cp) * 100 }
    : null;

  return (
    <div className="grid grid-cols-2 gap-5">
      <div>
        <div className="text-sm font-semibold text-[var(--text)] mb-4">
          Inputs
        </div>
        <div className="flex flex-col gap-3">
          {[
            {
              label: "Ticker",
              value: ticker,
              onChange: setTicker,
              placeholder: "e.g. INFY",
            },
            {
              label: "Current Price (₹)",
              value: currentPrice,
              onChange: setCurrentPrice,
              placeholder: selected?.currentPrice?.toFixed(2) || "0.00",
              type: "number",
            },
            {
              label: "EPS (TTM, ₹)",
              value: eps,
              onChange: setEps,
              placeholder: "e.g. 80",
              type: "number",
            },
            {
              label: "Earnings Growth Rate (%)",
              value: growthRate,
              onChange: setGrowthRate,
              placeholder: "e.g. 15",
              type: "number",
            },
            {
              label: "Target P/E Multiple",
              value: peTarget,
              onChange: setPeTarget,
              placeholder: "25",
              type: "number",
            },
            {
              label: "Years",
              value: years,
              onChange: setYears,
              placeholder: "3",
              type: "number",
            },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-[11px] text-[var(--muted)] block mb-1">
                {f.label}
              </label>
              <input
                type={f.type || "text"}
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                placeholder={f.placeholder}
                className="w-full py-2 px-[10px] bg-[var(--bg)] border border-[var(--border)] rounded-md text-[var(--text)] text-sm font-[var(--font-mono)] box-border"
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold text-[var(--text)] mb-4">
          Results
        </div>
        {selected && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg py-3 px-3.5 mb-3.5">
            <div className="text-xs font-semibold text-[var(--accent)] mb-1.5">
              {selected.ticker} — Saved Target
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-[var(--muted)]">
                  Target Price
                </div>
                <div className="text-base font-bold text-[var(--text)] font-[var(--font-mono)]">
                  {selected.targetPrice ? fmt(selected.targetPrice) : "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--muted)]">
                  Upside
                </div>
                <div
                  className={`text-base font-bold font-[var(--font-mono)] ${currentTarget && currentTarget.upside >= 0 ? "text-[var(--gain)]" : "text-[var(--loss)]"}`}
                >
                  {currentTarget
                    ? `${currentTarget.upside >= 0 ? "+" : ""}${currentTarget.upside.toFixed(1)}%`
                    : "—"}
                </div>
              </div>
            </div>
          </div>
        )}
        {intrinsicTarget !== undefined && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[10px] py-4 px-[18px]">
            <div className="text-xs text-[var(--muted)] mb-3">
              DCF / P/E Estimate ({yr}yr horizon)
            </div>
            {(
              [
                {
                  label: "Future EPS",
                  value:
                    futureEPS !== undefined ? `₹${futureEPS.toFixed(2)}` : "—",
                },
              {
                label: "Target Price",
                value:
                  intrinsicTarget !== undefined ? fmt(intrinsicTarget) : "—",
              },
              { label: "Current Price", value: fmt(cp) },
              {
                label: "Upside",
                value:
                  upside !== undefined
                    ? `${upside >= 0 ? "+" : ""}${upside.toFixed(1)}%`
                    : "—",
                color:
                  upside !== undefined
                    ? upside >= 0
                      ? "var(--gain)"
                      : "var(--loss)"
                    : "var(--text)",
              },
            ] as Array<{ label: string; value: string; color?: string }>
            ).map((r) => (
              <div
                key={r.label}
                className="flex justify-between py-2 border-b border-[var(--border)]"
              >
                <span className="text-sm text-[var(--muted)]">
                  {r.label}
                </span>
                <span
                  className="text-sm font-bold font-[var(--font-mono)]"
                  style={{ color: r.color || "var(--text)" }}
                >
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        )}
        {!intrinsicTarget && (
          <div className="p-[30px] text-center text-[var(--muted)] text-sm">
            Enter EPS, growth rate and P/E to calculate target
          </div>
        )}
      </div>
    </div>
  );
}
