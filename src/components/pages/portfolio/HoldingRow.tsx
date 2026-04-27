"use client";
import React from "react";
import { fmt } from "@/lib/formatters";
import { Badge, ConvictionDot, Gain, Sparkline, Icon } from "@/components/ui";
import type { PhoenixData } from "@/lib/data";

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
        style={{
          borderBottom: "1px solid var(--border)",
          cursor: "pointer",
          transition: "background .12s",
        }}
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
        <td style={{ padding: "12px 10px 12px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Icon
              name={expanded ? "arrowDown" : "chevronRight"}
              size={14}
              color="var(--muted)"
            />
            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {a.ticker ?? a.category}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                {a.name.slice(0, 24)}
                {a.exchange ? ` · ${a.exchange}` : ""}
              </div>
            </div>
          </div>
        </td>
        <td
          style={{
            textAlign: "right",
            padding: "12px 10px",
            fontFamily: "var(--font-mono)",
          }}
        >
          <div style={{ color: "var(--text)" }}>{fmt(a.current)}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            {fmt(a.invested)} in
          </div>
        </td>
        <td style={{ textAlign: "right", padding: "12px 10px" }}>
          <Gain value={a.gain} pct={a.gainPct} />
        </td>
        <td
          style={{
            textAlign: "right",
            padding: "12px 10px",
            fontFamily: "var(--font-mono)",
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
        <td style={{ padding: "12px 10px" }}>
          <Badge rec={a.rec} />
        </td>
        <td style={{ textAlign: "right", padding: "12px 10px" }}>
          <ConvictionDot score={a.conviction} />
        </td>
        <td
          style={{
            textAlign: "right",
            padding: "12px 10px",
            fontFamily: "var(--font-mono)",
            color: "var(--muted)",
            fontSize: 12,
          }}
        >
          <div>{a.holdingDays != null ? `${a.holdingDays}d` : "—"}</div>
          <div style={{ fontSize: 10 }}>{a.isLTCG ? "LTCG" : "STCG"}</div>
        </td>
        <td
          style={{
            textAlign: "right",
            padding: "12px 10px",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
          }}
        >
          {a.targetPrice ? (
            <>
              <div style={{ color: "var(--text)" }}>{fmt(a.targetPrice)}</div>
              <div
                style={{
                  color: toTarget! >= 0 ? "var(--gain)" : "var(--loss)",
                  fontSize: 11,
                }}
              >
                {toTarget! >= 0 ? "+" : ""}
                {toTarget!.toFixed(1)}%
              </div>
            </>
          ) : (
            <span style={{ color: "var(--muted)" }}>—</span>
          )}
        </td>
        <td
          style={{
            textAlign: "right",
            padding: "12px 16px 12px 10px",
          }}
        >
          <Sparkline
            data={sparkData}
            width={70}
            height={28}
            color={a.gainPct >= 0 ? "var(--gain)" : "var(--loss)"}
          />
        </td>
      </tr>
      {expanded && (
        <tr
          style={{
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <td colSpan={9} style={{ padding: "14px 24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    marginBottom: 5,
                  }}
                >
                  Entry Details
                </div>
                <div style={{ fontSize: 12, color: "var(--text)" }}>
                  Entry:{" "}
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {fmt(a.entryPrice)} × {a.qty}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 3,
                  }}
                >
                  Date: {a.entryDate}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 3,
                  }}
                >
                  Sector: {a.sector}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    marginBottom: 5,
                  }}
                >
                  Tax
                </div>
                <div style={{ fontSize: 12, color: "var(--text)" }}>
                  Rate:{" "}
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {a.taxRate != null
                      ? `${(a.taxRate * 100).toFixed(0)}%`
                      : "—"}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 3,
                  }}
                >
                  Tax:{" "}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--loss)",
                    }}
                  >
                    -{fmt(a.taxAmt ?? 0)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 3,
                  }}
                >
                  Post-tax:{" "}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--gain)",
                    }}
                  >
                    {fmt(a.postTaxGain)}
                  </span>
                </div>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    marginBottom: 5,
                  }}
                >
                  Research Note
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text)",
                    lineHeight: 1.6,
                  }}
                >
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
