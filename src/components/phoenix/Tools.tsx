// @ts-nocheck
"use client";
import { useState, useRef } from "react";
import { fmt, fmtPct, Badge, Gain, TabBar, Icon } from "./ui";
import { calcXIRR, pd } from "@/lib/data";
import type { PhoenixData } from "@/lib/data";

const TABS = [
  { id: "target", label: "Target Price" },
  { id: "whatif", label: "What-If" },
  { id: "import", label: "CSV Import" },
  { id: "export", label: "Export PDF" },
  { id: "taxpl", label: "Tax & P/L" },
  { id: "goals", label: "Goal Planning" },
];

// ─── Target Price Calculator ───────────────────────────────────────────────────
function TargetPriceCalc({ data }: { data: PhoenixData }) {
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
            {[
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
            ].map((r) => (
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
                    color: (r as any).color || "var(--text)",
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

// ─── What-If Simulator ────────────────────────────────────────────────────────
function WhatIfSimulator({ data }: { data: PhoenixData }) {
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
            {[
              { label: "Exit Price", value: fmt(ep) },
              { label: "Exit Value", value: fmt(ep * selected.qty) },
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
                  (selected.xirr ?? 0) >= 15 ? "var(--gain)" : "var(--warn)",
              },
            ].map((r) => (
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
                    color: (r as any).color || "var(--text)",
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

// ─── CSV Import ────────────────────────────────────────────────────────────────
function CSVImport() {
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text
        .trim()
        .split("\n")
        .map((r) => r.split(",").map((c) => c.trim()));
      setUploaded(file.name);
      setPreview(rows.slice(0, 6));
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: 16,
        }}
      >
        Import CSV Data
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 12,
          padding: 40,
          textAlign: "center",
          background: dragging ? "var(--accent-dim)" : "var(--surface)",
          cursor: "pointer",
          transition: "all .2s",
        }}
      >
        <Icon
          name="upload"
          size={32}
          color={dragging ? "var(--accent)" : "var(--muted)"}
        />
        <div
          style={{
            marginTop: 12,
            fontSize: 14,
            color: dragging ? "var(--accent)" : "var(--text)",
          }}
        >
          {dragging ? "Drop to upload" : "Drag & drop CSV or click to browse"}
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
          Supports Zerodha, Groww, Kite export formats
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {uploaded && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: "var(--gain)", marginBottom: 10 }}>
            ✓ Loaded: {uploaded}
          </div>
          <div
            style={{
              overflowX: "auto",
              background: "var(--surface)",
              borderRadius: 8,
              border: "1px solid var(--border)",
            }}
          >
            <table
              style={{
                borderCollapse: "collapse",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                width: "100%",
              }}
            >
              {preview.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      style={{
                        padding: "7px 12px",
                        color: i === 0 ? "var(--muted)" : "var(--text)",
                        fontWeight: i === 0 ? 600 : 400,
                        background: i === 0 ? "var(--surface2)" : "transparent",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </table>
          </div>
          <button
            style={{
              marginTop: 12,
              padding: "8px 20px",
              background: "var(--accent)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Import {preview.length - 1} Rows
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tax & P/L ────────────────────────────────────────────────────────────────
function TaxPL({ data }: { data: PhoenixData }) {
  const ltcg = data.assets.filter((a) => a.isLTCG);
  const stcg = data.assets.filter((a) => !a.isLTCG);

  const totalLTCGGain = ltcg.reduce((s, a) => s + a.gain, 0);
  const totalSTCGGain = stcg.reduce((s, a) => s + a.gain, 0);
  const totalLTCGTax = ltcg.reduce((s, a) => s + (a.taxAmt ?? 0), 0);
  const totalSTCGTax = stcg.reduce((s, a) => s + (a.taxAmt ?? 0), 0);

  const summaryRows = [
    {
      label: "LTCG Gains (≥1yr @ 10%)",
      value: totalLTCGGain,
      color: totalLTCGGain >= 0 ? "var(--gain)" : "var(--loss)",
    },
    { label: "LTCG Tax Liability", value: -totalLTCGTax, color: "var(--loss)" },
    {
      label: "STCG Gains (<1yr @ 15%)",
      value: totalSTCGGain,
      color: totalSTCGGain >= 0 ? "var(--gain)" : "var(--loss)",
    },
    { label: "STCG Tax Liability", value: -totalSTCGTax, color: "var(--loss)" },
    {
      label: "Total Tax",
      value: -(totalLTCGTax + totalSTCGTax),
      color: "var(--loss)",
    },
    {
      label: "Post-Tax Gains",
      value: data.postTaxGains,
      color: "var(--accent)",
    },
  ];

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
          Tax Summary (FY 2025-26)
        </div>
        {summaryRows.map((r) => (
          <div
            key={r.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
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
                color: r.color,
                fontFamily: "var(--font-mono)",
              }}
            >
              {fmt(Math.abs(r.value))}
              {r.value < 0 ? " debit" : ""}
            </span>
          </div>
        ))}
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
          Per-Stock Breakdown
        </div>
        <div style={{ overflowY: "auto", maxHeight: 400 }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Ticker", "Type", "Gain", "Tax", "Post-Tax"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "6px 10px",
                      textAlign: h === "Ticker" ? "left" : "right",
                      fontSize: 10,
                      color: "var(--muted)",
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...data.assets]
                .sort((a, b) => b.gain - a.gain)
                .map((a) => (
                  <tr
                    key={a.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td
                      style={{
                        padding: "8px 10px",
                        fontWeight: 600,
                        color: "var(--text)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {a.ticker ?? a.category}
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 99,
                          background: a.isLTCG
                            ? "rgba(16,185,129,.15)"
                            : "rgba(245,158,11,.15)",
                          color: a.isLTCG ? "var(--gain)" : "var(--warn)",
                          fontWeight: 600,
                        }}
                      >
                        {a.isLTCG ? "LTCG" : a.isLTCG === false ? "STCG" : "—"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        textAlign: "right",
                        color: a.gain >= 0 ? "var(--gain)" : "var(--loss)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {fmt(a.gain)}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        textAlign: "right",
                        color: "var(--loss)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {a.taxAmt != null ? `-${fmt(a.taxAmt)}` : "—"}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        textAlign: "right",
                        color: "var(--gain)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {fmt(a.postTaxGain)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Goal Planning ────────────────────────────────────────────────────────────
function GoalPlanning({ data }: { data: PhoenixData }) {
  const [goals, setGoals] = useState(data.goals);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    targetYear: "2030",
    currentAmount: "",
    monthlyAddition: "",
    icon: "🎯",
    color: "#6366f1",
  });

  const deleteGoal = (id: string) =>
    setGoals((prev) => prev.filter((g) => g.id !== id));

  const addGoal = () => {
    const goal = {
      id: `g${Date.now()}`,
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount) || 0,
      targetYear: parseInt(newGoal.targetYear) || 2030,
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      monthlyAddition: parseFloat(newGoal.monthlyAddition) || 0,
      icon: newGoal.icon,
      color: newGoal.color,
    };
    setGoals((prev) => [...prev, goal]);
    setShowAdd(false);
    setNewGoal({
      name: "",
      targetAmount: "",
      targetYear: "2030",
      currentAmount: "",
      monthlyAddition: "",
      icon: "🎯",
      color: "#6366f1",
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
          Financial Goals
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            background: "var(--accent)",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <Icon name="plus" size={14} color="#fff" />
          Add Goal
        </button>
      </div>

      {showAdd && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 14,
            }}
          >
            New Goal
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            {[
              {
                label: "Goal Name",
                key: "name",
                type: "text",
                placeholder: "e.g. Retirement Fund",
              },
              {
                label: "Target Amount (₹)",
                key: "targetAmount",
                type: "number",
                placeholder: "10000000",
              },
              {
                label: "Target Year",
                key: "targetYear",
                type: "number",
                placeholder: "2030",
              },
              {
                label: "Current Amount (₹)",
                key: "currentAmount",
                type: "number",
                placeholder: "0",
              },
              {
                label: "Monthly Addition (₹)",
                key: "monthlyAddition",
                type: "number",
                placeholder: "50000",
              },
            ].map((f) => (
              <div key={f.key}>
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
                  type={f.type}
                  value={(newGoal as any)[f.key]}
                  onChange={(e) =>
                    setNewGoal((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  placeholder={f.placeholder}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--text)",
                    fontSize: 12,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={addGoal}
              style={{
                padding: "7px 18px",
                background: "var(--accent)",
                border: "none",
                borderRadius: 6,
                color: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Save
            </button>
            <button
              onClick={() => setShowAdd(false)}
              style={{
                padding: "7px 14px",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {goals.map((g) => {
          const pct = Math.min(
            100,
            g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0,
          );
          const remaining = g.targetAmount - g.currentAmount;
          const yearsLeft = g.targetYear - new Date().getFullYear();
          const monthsLeft = yearsLeft * 12;
          const monthlyNeeded =
            monthsLeft > 0 && remaining > 0 ? remaining / monthsLeft : 0;
          const onTrack = g.monthlyAddition >= monthlyNeeded;

          return (
            <div
              key={g.id}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{g.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {g.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      Target: {g.targetYear}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(g.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    padding: 4,
                  }}
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {fmt(g.currentAmount)} saved
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: "var(--border)",
                  borderRadius: 99,
                  overflow: "hidden",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: g.color || "var(--accent)",
                    borderRadius: 99,
                    transition: "width .4s",
                  }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    Target
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text)",
                    }}
                  >
                    {fmt(g.targetAmount)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    Remaining
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text)",
                    }}
                  >
                    {fmt(remaining)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    Monthly SIP
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text)",
                    }}
                  >
                    {fmt(g.monthlyAddition)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    Needed/month
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: onTrack ? "var(--gain)" : "var(--loss)",
                    }}
                  >
                    {fmt(monthlyNeeded)}
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: onTrack
                    ? "rgba(16,185,129,.12)"
                    : "rgba(239,68,68,.12)",
                  color: onTrack ? "var(--gain)" : "var(--loss)",
                }}
              >
                {yearsLeft}yr left ·{" "}
                {onTrack
                  ? "✓ On track"
                  : `⚠ Need +${fmt(monthlyNeeded - g.monthlyAddition)}/mo more`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Export PDF ────────────────────────────────────────────────────────────────
function ExportPDF({ data }: { data: PhoenixData }) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(["dashboard", "portfolio", "analysis"]),
  );
  const sections = [
    { id: "dashboard", label: "Dashboard Overview" },
    { id: "portfolio", label: "Portfolio Holdings" },
    { id: "analysis", label: "Performance Analysis" },
    { id: "compare", label: "Benchmark Comparison" },
    { id: "taxpl", label: "Tax & P/L Summary" },
    { id: "goals", label: "Goal Planning" },
  ];

  const toggleSection = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportPDF = () => {
    const content = `Phoenix Portfolio Report — ${new Date().toLocaleDateString()}
Portfolio Value: ${fmt(data.netWorth)}
XIRR: ${data.xirr.toFixed(1)}%
Total Gain: ${fmt(data.totalGains)} (${fmtPct(data.totalGainsPct)})

Holdings:
${data.assets.map((a) => `${a.ticker ?? a.category}: ${fmt(a.current)} | ${fmtPct(a.gainPct)} | XIRR ${a.xirr != null ? a.xirr.toFixed(1) + "%" : "—"}`).join("\n")}`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(
        `<pre style="font-family:monospace;padding:20px">${content}</pre>`,
      );
      w.setTimeout(() => w.print(), 500);
    }
  };

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
          Select Sections
        </div>
        {sections.map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              background: selected.has(s.id)
                ? "var(--accent-dim)"
                : "var(--surface)",
              border: `1px solid ${selected.has(s.id) ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 8,
              marginBottom: 8,
              cursor: "pointer",
            }}
            onClick={() => toggleSection(s.id)}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                background: selected.has(s.id)
                  ? "var(--accent)"
                  : "transparent",
                border: `2px solid ${selected.has(s.id) ? "var(--accent)" : "var(--border)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {selected.has(s.id) && (
                <span style={{ color: "#fff", fontSize: 10, fontWeight: 800 }}>
                  ✓
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: 13,
                color: selected.has(s.id) ? "var(--text)" : "var(--muted)",
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
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
          Export Options
        </div>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "16px 18px",
            marginBottom: 16,
          }}
        >
          <div
            style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}
          >
            Summary
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "Portfolio Value", value: fmt(data.netWorth) },
              { label: "XIRR", value: `${data.xirr.toFixed(1)}%` },
              { label: "Total Gain", value: fmt(data.totalGains) },
              { label: "Holdings", value: `${data.assets.length} stocks` },
              { label: "Sections", value: `${selected.size} selected` },
            ].map((r) => (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "var(--muted)" }}>{r.label}</span>
                <span
                  style={{
                    color: "var(--text)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={exportPDF}
          disabled={selected.size === 0}
          style={{
            width: "100%",
            padding: "12px",
            background: selected.size > 0 ? "var(--accent)" : "var(--border)",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            cursor: selected.size > 0 ? "pointer" : "not-allowed",
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Icon name="download" size={16} color="#fff" />
          Export PDF ({selected.size} sections)
        </button>
      </div>
    </div>
  );
}

// ─── Main Tools component ─────────────────────────────────────────────────────
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
