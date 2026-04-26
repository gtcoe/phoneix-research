// @ts-nocheck
"use client";
import { useState } from "react";
import { fmt, fmtPct } from "@/lib/formatters";
import { Badge, ConvictionDot, Gain, Icon } from "@/components/ui";
import type { PhoenixData } from "@/lib/data";

type WatchItem = PhoenixData["watchlist"][number];

const STATUS_OPTIONS = ["watching", "interested", "passed"] as const;
type WatchStatus = (typeof STATUS_OPTIONS)[number];
const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: "Watching",
  interested: "Interested",
  passed: "Passed",
};
const STATUS_COLORS: Record<WatchStatus, string> = {
  watching: "var(--info)",
  interested: "var(--warn)",
  passed: "var(--muted)",
};

export function WatchCard({
  item,
  onStatusChange,
  onRemove,
  onThesisSave,
}: {
  item: WatchItem;
  onStatusChange: (id: string, status: string) => void;
  onRemove: (id: string) => void;
  onThesisSave: (id: string, thesis: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingThesis, setEditingThesis] = useState(false);
  const [thesisVal, setThesisVal] = useState(item.thesis || "");

  const priceDiffPct = item.sinceAddedPct;
  const toAlert = item.alertPrice
    ? ((item.alertPrice - item.currentPrice) / item.currentPrice) * 100
    : null;

  const saveThesis = () => {
    onThesisSave(item.id, thesisVal);
    setEditingThesis(false);
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        transition: "border-color .15s",
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {item.ticker}
              </span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                {item.exchange}
              </span>
              <Badge rec={item.rec} size="xs" />
            </div>
            <div style={{ fontSize: 12, color: "var(--text)", marginTop: 3 }}>
              {item.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              {item.sector} · {item.mcap}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
            }}
          >
            <ConvictionDot score={item.conviction} />
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 99,
                background: "var(--surface)",
                color: STATUS_COLORS[item.status as WatchStatus] || "var(--muted)",
                fontWeight: 600,
                border: `1px solid ${STATUS_COLORS[item.status as WatchStatus] || "var(--border)"}`,
              }}
            >
              {STATUS_LABELS[item.status as WatchStatus] || item.status}
            </span>
          </div>
        </div>
      </div>

      {/* Price info */}
      <div
        style={{
          padding: "12px 16px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2 }}>
            Current
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
            }}
          >
            ₹{item.currentPrice.toFixed(2)}
          </div>
          <div
            style={{
              fontSize: 11,
              color: priceDiffPct >= 0 ? "var(--gain)" : "var(--loss)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {priceDiffPct >= 0 ? "+" : ""}
            {priceDiffPct.toFixed(1)}% since add
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2 }}>
            Added At
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
            }}
          >
            ₹{item.priceAtAdd.toFixed(2)}
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)" }}>
            {item.addedDate}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2 }}>
            Alert
          </div>
          {item.alertPrice ? (
            <>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ₹{item.alertPrice.toFixed(2)}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: toAlert! <= 0 ? "var(--gain)" : "var(--muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {toAlert! <= 0
                  ? "🔔 Triggered"
                  : `${toAlert!.toFixed(1)}% away`}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: "var(--muted)" }}>—</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          padding: "8px 16px 12px",
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <select
          value={item.status}
          onChange={(e) => onStatusChange(item.id, e.target.value)}
          style={{
            padding: "4px 8px",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--text)",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        {item.reportFile && (
          <a
            href={`/analyses/${item.reportFile.replace(/^analyses\//, "")}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "var(--accent)",
              textDecoration: "none",
              padding: "4px 10px",
              border: "1px solid var(--border)",
              borderRadius: 6,
            }}
          >
            <Icon name="external" size={12} />
            Report
          </a>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            marginLeft: "auto",
            padding: "4px 10px",
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          {expanded ? "Hide" : "Thesis"}
        </button>
        <button
          onClick={() => onRemove(item.id)}
          style={{
            padding: 4,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted)",
            display: "flex",
          }}
        >
          <Icon name="trash" size={14} />
        </button>
      </div>

      {/* Expanded thesis — state local to this card, never leaks */}
      {expanded && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          {editingThesis ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <textarea
                value={thesisVal}
                onChange={(e) => setThesisVal(e.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  padding: 10,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "var(--text)",
                  fontSize: 12,
                  fontFamily: "inherit",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={saveThesis}
                  style={{
                    padding: "5px 14px",
                    background: "var(--accent)",
                    border: "none",
                    borderRadius: 6,
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setThesisVal(item.thesis || "");
                    setEditingThesis(false);
                  }}
                  style={{
                    padding: "5px 14px",
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
          ) : (
            <div
              onClick={() => {
                setThesisVal(item.thesis || "");
                setEditingThesis(true);
              }}
              style={{ cursor: "text" }}
            >
              <div
                style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6 }}
              >
                {item.thesis || (
                  <span style={{ color: "var(--muted)", fontStyle: "italic" }}>
                    Click to add thesis…
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
