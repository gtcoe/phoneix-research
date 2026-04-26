"use client";
import { useState } from "react";
import type { PhoenixData } from "@/lib/data";

type AlphaRow = PhoenixData["assets"][number] & { alpha: number; benchXirr: number };

export function AlphaTable({ data }: { data: PhoenixData }) {
  const [alphaSort, setAlphaSort] = useState<{ col: string; dir: "asc" | "desc" }>({
    col: "alpha",
    dir: "desc",
  });

  const alphaRowsBase: AlphaRow[] = data.assets.map((a) => ({
    ...a,
    alpha: (a.xirr ?? 0) - data.benchmarks.nifty50.xirr,
    benchXirr: data.benchmarks.nifty50.xirr,
  }));

  const alphaRows = [...alphaRowsBase].sort((a, b) => {
    let av: number | string, bv: number | string;
    switch (alphaSort.col) {
      case "ticker":
        av = a.ticker ?? a.name;
        bv = b.ticker ?? b.name;
        return alphaSort.dir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      case "xirr":
        av = a.xirr ?? 0;
        bv = b.xirr ?? 0;
        break;
      case "benchXirr":
        av = a.benchXirr;
        bv = b.benchXirr;
        break;
      default: // alpha
        av = a.alpha;
        bv = b.alpha;
    }
    return alphaSort.dir === "asc"
      ? (av as number) - (bv as number)
      : (bv as number) - (av as number);
  });

  const sortBy = (col: string) => {
    setAlphaSort((prev) =>
      prev.col === col
        ? { col, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { col, dir: "desc" },
    );
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (alphaSort.col !== col) return <span style={{ color: "var(--border)", marginLeft: 4 }}>↕</span>;
    return (
      <span style={{ color: "var(--accent)", marginLeft: 4 }}>
        {alphaSort.dir === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
          Holding-Level Alpha vs Nifty 50
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>
          Click column headers to sort
        </div>
      </div>

      {/* Sortable table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12,
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {[
                { col: "ticker", label: "Ticker" },
                { col: "xirr", label: "Asset XIRR" },
                { col: "benchXirr", label: "Nifty 50 XIRR" },
                { col: "alpha", label: "Excess Return (α)" },
              ].map(({ col, label }) => (
                <th
                  key={col}
                  onClick={() => sortBy(col)}
                  style={{
                    padding: "8px 12px",
                    textAlign: col === "ticker" ? "left" : "right",
                    color: alphaSort.col === col ? "var(--accent)" : "var(--muted)",
                    fontWeight: 600,
                    cursor: "pointer",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                  <SortIcon col={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alphaRows.map((a) => (
              <tr
                key={a.id}
                style={{
                  borderBottom: "1px solid var(--border)",
                  transition: "background .1s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background =
                    "var(--surface)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background =
                    "transparent")
                }
              >
                <td
                  style={{
                    padding: "10px 12px",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    color: "var(--accent)",
                  }}
                >
                  {a.ticker ?? a.name}
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--muted)",
                      fontWeight: 400,
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {a.name}
                  </div>
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontFamily: "var(--font-mono)",
                    color: (a.xirr ?? 0) >= 0 ? "var(--gain)" : "var(--loss)",
                    fontWeight: 600,
                  }}
                >
                  {a.xirr != null ? `${a.xirr.toFixed(1)}%` : "—"}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontFamily: "var(--font-mono)",
                    color: "var(--muted)",
                  }}
                >
                  {a.benchXirr.toFixed(1)}%
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    color: a.alpha >= 0 ? "var(--gain)" : "var(--loss)",
                  }}
                >
                  {a.alpha >= 0 ? "+" : ""}
                  {a.alpha.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "12px 16px",
          background: "var(--surface)",
          borderRadius: 8,
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          Outperformers:{" "}
          <span style={{ color: "var(--gain)", fontWeight: 600 }}>
            {alphaRows.filter((a) => a.alpha > 0).length}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          Underperformers:{" "}
          <span style={{ color: "var(--loss)", fontWeight: 600 }}>
            {alphaRows.filter((a) => a.alpha <= 0).length}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          Portfolio avg α:{" "}
          <span
            style={{
              color: "var(--accent)",
              fontWeight: 600,
              fontFamily: "var(--font-mono)",
            }}
          >
            +{data.alpha.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
