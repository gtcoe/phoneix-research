"use client";
import React from "react";
import { fmt } from "@/lib/formatters";
import { Badge, ConvictionDot, Gain, Sparkline, Icon } from "@/components/ui";
import type { PhoenixData } from "@/types";

type Asset = PhoenixData["assets"][number];

interface Props {
  asset: Asset;
  expanded: boolean;
  onToggle: () => void;
}

export default function HoldingRow({ asset: a, expanded, onToggle }: Props) {
  const cp = a.currentPrice ?? a.current;
  const ep = a.entryPrice ?? a.invested;
  const toTarget = a.targetPrice
    ? ((a.targetPrice - cp) / cp) * 100
    : null;
  const sparkData = [ep, cp * 0.85, cp * 0.92, cp * 0.88, cp * 0.97, cp];

  return (
    <>
      <tr
        className="border-b border-[var(--border)] cursor-pointer transition-colors duration-100"
        onClick={onToggle}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLTableRowElement).style.background =
            "var(--surface)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLTableRowElement).style.background =
            "transparent")
        }
      >
        <td className="py-3 px-[10px] pl-4">
          <div className="flex items-center gap-2">
            <Icon
              name={expanded ? "arrowDown" : "chevronRight"}
              size={14}
              color="var(--muted)"
            />
            <div>
              <div className="font-semibold text-[var(--text)] font-[var(--font-mono)]">
                {a.ticker ?? a.category}
              </div>
              <div className="text-[11px] text-[var(--muted)]">
                {a.name.slice(0, 24)}
                {a.exchange ? ` · ${a.exchange}` : ""}
              </div>
            </div>
          </div>
        </td>
        <td className="text-right py-3 px-[10px] font-[var(--font-mono)]">
          <div className="text-[var(--text)]">{fmt(a.current)}</div>
          <div className="text-[11px] text-[var(--muted)]">
            {fmt(a.invested)} in
          </div>
        </td>
        <td className="text-right py-3 px-[10px]">
          <Gain value={a.gain} pct={a.gainPct} />
        </td>
        <td
          className="text-right py-3 px-[10px] font-[var(--font-mono)]"
          style={{
            color:
              (a.xirr ?? 0) >= 15
                ? "var(--gain)"
                : (a.xirr ?? 0) >= 0
                  ? "var(--warn)"
                  : "var(--loss)",
          }}
        >
          {a.xirr != null ? `${a.xirr.toFixed(1)}%` : "—"}
        </td>
        <td className="py-3 px-[10px]">
          <Badge rec={a.rec} />
        </td>
        <td className="text-right py-3 px-[10px]">
          <ConvictionDot score={a.conviction} />
        </td>
        <td className="text-right py-3 px-[10px] font-[var(--font-mono)] text-[var(--muted)] text-xs">
          <div>{a.holdingDays != null ? `${a.holdingDays}d` : "—"}</div>
          <div className="text-[10px]">{a.isLTCG ? "LTCG" : "STCG"}</div>
        </td>
        <td className="text-right py-3 px-[10px] font-[var(--font-mono)] text-xs">
          {a.targetPrice ? (
            <>
              <div className="text-[var(--text)]">{fmt(a.targetPrice)}</div>
              <div
                className="text-[11px]"
                style={{ color: toTarget! >= 0 ? "var(--gain)" : "var(--loss)" }}
              >
                {toTarget! >= 0 ? "+" : ""}
                {toTarget!.toFixed(1)}%
              </div>
            </>
          ) : (
            <span className="text-[var(--muted)]">—</span>
          )}
        </td>
        <td className="text-right py-3 px-[10px] pr-4">
          <Sparkline
            data={sparkData}
            width={70}
            height={28}
            color={a.gainPct >= 0 ? "var(--gain)" : "var(--loss)"}
          />
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
          <td colSpan={9} className="py-3.5 px-6">
            <div className="grid grid-cols-4 gap-3.5">
              <div>
                <div className="text-[11px] text-[var(--muted)] mb-[5px]">
                  Entry Details
                </div>
                <div className="text-xs text-[var(--text)]">
                  Entry:{" "}
                  <span className="font-[var(--font-mono)]">
                    {fmt(a.entryPrice)} × {a.qty}
                  </span>
                </div>
                <div className="text-xs text-[var(--muted)] mt-[3px]">
                  Date: {a.entryDate}
                </div>
                <div className="text-xs text-[var(--muted)] mt-[3px]">
                  Sector: {a.sector}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--muted)] mb-[5px]">
                  Tax
                </div>
                <div className="text-xs text-[var(--text)]">
                  Rate:{" "}
                  <span className="font-[var(--font-mono)]">
                    {a.taxRate != null
                      ? `${(a.taxRate * 100).toFixed(0)}%`
                      : "—"}
                  </span>
                </div>
                <div className="text-xs text-[var(--muted)] mt-[3px]">
                  Tax:{" "}
                  <span className="font-[var(--font-mono)] text-[var(--loss)]">
                    -{fmt(a.taxAmt ?? 0)}
                  </span>
                </div>
                <div className="text-xs text-[var(--muted)] mt-[3px]">
                  Post-tax:{" "}
                  <span className="font-[var(--font-mono)] text-[var(--gain)]">
                    {fmt(a.postTaxGain)}
                  </span>
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[11px] text-[var(--muted)] mb-[5px]">
                  Research Note
                </div>
                <div className="text-xs text-[var(--text)] leading-relaxed">
                  {a.targetNote || "—"}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
