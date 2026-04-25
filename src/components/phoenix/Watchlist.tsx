// @ts-nocheck
"use client";
import { useState } from "react";
import { fmt, fmtPct, Badge, ConvictionDot, Gain, Icon } from "./ui";
import type { PhoenixData } from "@/lib/data";

type WatchItem = PhoenixData["watchlist"][number];

const STATUS_OPTIONS = ["watching", "ready_to_buy", "bought", "pass"];
const STATUS_LABELS: Record<string, string> = {
  watching: "Watching",
  ready_to_buy: "Ready to Buy",
  bought: "Bought",
  pass: "Pass",
};
const STATUS_COLORS: Record<string, string> = {
  watching: "var(--info)",
  ready_to_buy: "var(--warn)",
  bought: "var(--gain)",
  pass: "var(--muted)",
};

export default function Watchlist({ data }: { data: PhoenixData }) {
  const [items, setItems] = useState<WatchItem[]>(data.watchlist);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingThesis, setEditingThesis] = useState<string | null>(null);
  const [thesisVal, setThesisVal] = useState("");

  const filtered = items.filter(
    (i) => statusFilter === "all" || i.status === statusFilter,
  );

  const updateStatus = (id: string, status: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const saveThesis = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, thesis: thesisVal } : i)),
    );
    setEditingThesis(null);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "5px 14px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              border: "1px solid var(--border)",
              background:
                statusFilter === s ? "var(--accent)" : "var(--surface)",
              color: statusFilter === s ? "#fff" : "var(--muted)",
              transition: "all .15s",
            }}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 12,
            color: "var(--muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {filtered.length} stocks
        </span>
      </div>

      {/* Cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 14,
        }}
      >
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;
          const priceDiff = item.currentPrice - item.priceAtAdd;
          const priceDiffPct =
            item.priceAtAdd > 0 ? (priceDiff / item.priceAtAdd) * 100 : 0;
          const toAlert = item.alertPrice
            ? ((item.alertPrice - item.currentPrice) / item.currentPrice) * 100
            : null;

          return (
            <div
              key={item.id}
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
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
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
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text)",
                        marginTop: 3,
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
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
                        color: STATUS_COLORS[item.status] || "var(--muted)",
                        fontWeight: 600,
                        border: `1px solid ${STATUS_COLORS[item.status] || "var(--border)"}`,
                      }}
                    >
                      {STATUS_LABELS[item.status] || item.status}
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
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--muted)",
                      marginBottom: 2,
                    }}
                  >
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
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--muted)",
                      marginBottom: 2,
                    }}
                  >
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
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--muted)",
                      marginBottom: 2,
                    }}
                  >
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
                  onChange={(e) => updateStatus(item.id, e.target.value)}
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
                {item.file && (
                  <a
                    href={`/analyses/${item.file.replace(/^analyses\//, "")}`}
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
                  onClick={() => {
                    setExpandedId(isExpanded ? null : item.id);
                  }}
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
                  {isExpanded ? "Hide" : "Thesis"}
                </button>
                <button
                  onClick={() => removeItem(item.id)}
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

              {/* Expanded thesis */}
              {isExpanded && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderTop: "1px solid var(--border)",
                    background: "var(--surface)",
                  }}
                >
                  {editingThesis === item.id ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
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
                          onClick={() => saveThesis(item.id)}
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
                          onClick={() => setEditingThesis(null)}
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
                        setEditingThesis(item.id);
                        setThesisVal(item.thesis || "");
                      }}
                      style={{ cursor: "text" }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text)",
                          lineHeight: 1.6,
                        }}
                      >
                        {item.thesis || (
                          <span
                            style={{
                              color: "var(--muted)",
                              fontStyle: "italic",
                            }}
                          >
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
        })}
      </div>

      {filtered.length === 0 && (
        <div
          style={{ padding: 60, textAlign: "center", color: "var(--muted)" }}
        >
          <Icon name="watchlist" size={36} color="var(--border)" />
          <div style={{ marginTop: 12, fontSize: 14 }}>
            No stocks in this filter
          </div>
        </div>
      )}
    </div>
  );
}
