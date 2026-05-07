"use client";
import { useState } from "react";
import type { PhoenixData } from "@/types";

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
    if (alphaSort.col !== col) return <span className="text-[var(--border)] ml-1">↕</span>;
    return (
      <span className="text-[var(--accent)] ml-1">
        {alphaSort.dir === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-[18px] px-5">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-semibold text-[var(--text)]">
          Holding-Level Alpha vs Nifty 50
        </div>
        <div className="text-[11px] text-[var(--muted)]">
          Click column headers to sort
        </div>
      </div>

      {/* Sortable table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {[
                { col: "ticker", label: "Ticker" },
                { col: "xirr", label: "Asset XIRR" },
                { col: "benchXirr", label: "Nifty 50 XIRR" },
                { col: "alpha", label: "Excess Return (α)" },
              ].map(({ col, label }) => (
                <th
                  key={col}
                  onClick={() => sortBy(col)}
                  className={`py-2 px-3 font-semibold cursor-pointer select-none whitespace-nowrap ${col === "ticker" ? "text-left" : "text-right"} ${alphaSort.col === col ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}
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
                className="border-b border-[var(--border)] transition-colors duration-100"
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background =
                    "var(--surface)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background =
                    "transparent")
                }
              >
                <td className="py-[10px] px-3 font-[var(--font-mono)] font-bold text-[var(--accent)]">
                  {a.ticker ?? a.name}
                  <div className="text-[10px] text-[var(--muted)] font-normal font-[var(--font-sans)]">
                    {a.name}
                  </div>
                </td>
                <td
                  className={`py-[10px] px-3 text-right font-[var(--font-mono)] font-semibold ${(a.xirr ?? 0) >= 0 ? "text-[var(--gain)]" : "text-[var(--loss)]"}`}
                >
                  {a.xirr != null ? `${a.xirr.toFixed(1)}%` : "—"}
                </td>
                <td className="py-[10px] px-3 text-right font-[var(--font-mono)] text-[var(--muted)]">
                  {a.benchXirr.toFixed(1)}%
                </td>
                <td
                  className={`py-[10px] px-3 text-right font-[var(--font-mono)] font-bold ${a.alpha >= 0 ? "text-[var(--gain)]" : "text-[var(--loss)]"}`}
                >
                  {a.alpha >= 0 ? "+" : ""}
                  {a.alpha.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 py-3 px-4 bg-[var(--surface)] rounded-lg flex gap-6 flex-wrap">
        <div className="text-xs text-[var(--muted)]">
          Outperformers:{" "}
          <span className="text-[var(--gain)] font-semibold">
            {alphaRows.filter((a) => a.alpha > 0).length}
          </span>
        </div>
        <div className="text-xs text-[var(--muted)]">
          Underperformers:{" "}
          <span className="text-[var(--loss)] font-semibold">
            {alphaRows.filter((a) => a.alpha <= 0).length}
          </span>
        </div>
        <div className="text-xs text-[var(--muted)]">
          Portfolio avg α:{" "}
          <span className="text-[var(--accent)] font-semibold font-[var(--font-mono)]">
            +{data.alpha.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
