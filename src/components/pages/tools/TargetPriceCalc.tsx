"use client";
import { useState } from "react";
import { fmt } from "@/lib/formatters";
import type { PhoenixData } from "@/lib/data";

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
          Inputs
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
              <label
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                {f.label}
              </label>
              <input
                type={f.type || "text"}
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                placeholder={f.placeholder}
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
          ))}
        </div>
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
          Results
        </div>
        {selected && (
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "12px 14px",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--accent)",
                marginBottom: 6,
              }}
            >
              {selected.ticker} — Saved Target
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>
                  Target Price
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {selected.targetPrice ? fmt(selected.targetPrice) : "—"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>
                  Upside
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color:
                      currentTarget && currentTarget.upside >= 0
                        ? "var(--gain)"
                        : "var(--loss)",
                    fontFamily: "var(--font-mono)",
                  }}
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
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "16px 18px",
            }}
          >
            <div
              style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}
            >
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
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--muted)" }}>
                  {r.label}
                </span>
                <span
                  style={{
                    fontSize: 14,
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
        )}
        {!intrinsicTarget && (
          <div
            style={{
              padding: 30,
              textAlign: "center",
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            Enter EPS, growth rate and P/E to calculate target
          </div>
        )}
      </div>
    </div>
  );
}
