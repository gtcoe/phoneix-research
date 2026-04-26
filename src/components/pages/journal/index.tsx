"use client";
import { useState } from "react";
import { fmt, fmtPct } from "@/lib/formatters";
import { Icon } from "@/components/ui";
import LogTransactionModal from "@/components/common/modals/LogTransactionModal";
import type { PhoenixData } from "@/lib/data";

const TYPE_COLORS: Record<string, string> = {
  buy: "var(--gain)",
  sell: "var(--loss)",
  add: "var(--gain)",
  note: "var(--info)",
  thesis: "var(--accent)",
  milestone: "var(--warn)",
};

export default function Journal({ data }: { data: PhoenixData }) {
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showLogTx, setShowLogTx] = useState(false);

  const allTypes = [
    "all",
    ...Array.from(new Set(data.transactions.map((t) => t.type))),
  ];
  const allCategories = [
    "all",
    ...Array.from(new Set(data.transactions.map((t) => t.category))),
  ];

  const filtered = data.transactions.filter((t) => {
    const typeOk = filterType === "all" || t.type === filterType;
    const catOk = filterCategory === "all" || t.category === filterCategory;
    const searchOk =
      !search ||
      t.asset.toLowerCase().includes(search.toLowerCase()) ||
      t.ticker?.toLowerCase().includes(search.toLowerCase()) ||
      t.notes?.toLowerCase().includes(search.toLowerCase());
    return typeOk && catOk && searchOk;
  });

  // Monthly deployment bar chart
  const monthlyMap: Record<string, number> = {};
  data.transactions
    .filter((t) => t.type === "buy" || t.type === "add")
    .forEach((t) => {
      const d = t.dateObj;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + t.amount;
    });
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12);
  const maxMonthly = Math.max(...monthlyData.map(([, v]) => v), 1);

  return (
    <div style={{ padding: 24 }}>
      {/* Monthly deployment mini chart */}
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
          Monthly Deployment
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 6,
            height: 60,
          }}
        >
          {monthlyData.map(([label, val]) => (
            <div
              key={label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                title={`${label}: ${fmt(val)}`}
                style={{
                  width: "100%",
                  height: `${(val / maxMonthly) * 52}px`,
                  minHeight: 2,
                  background: "var(--accent)",
                  borderRadius: "3px 3px 0 0",
                  opacity: 0.85,
                  cursor: "default",
                  transition: "opacity .15s",
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  color: "var(--muted)",
                  fontFamily: "var(--font-mono)",
                  whiteSpace: "nowrap",
                }}
              >
                {label.slice(5)}/{label.slice(2, 4)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar + add button */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          style={{
            padding: "6px 12px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text)",
            fontSize: 12,
            outline: "none",
            width: 180,
          }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: "6px 12px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text)",
            fontSize: 12,
          }}
        >
          {allTypes.map((t) => (
            <option key={t} value={t}>
              {t === "all"
                ? "All Types"
                : t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: "6px 12px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text)",
            fontSize: 12,
          }}
        >
          {allCategories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All Categories" : c}
            </option>
          ))}
        </select>
        <span
          style={{
            fontSize: 12,
            color: "var(--muted)",
            fontFamily: "var(--font-mono)",
            marginLeft: 4,
          }}
        >
          {filtered.length} entries
        </span>
        <button
          onClick={() => setShowLogTx(true)}
          style={{
            marginLeft: "auto",
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
          Log Transaction
        </button>
      </div>

      {showLogTx && (
        <LogTransactionModal
          assets={data.assets}
          onClose={() => setShowLogTx(false)}
        />
      )}

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: 24 }}>
        <div
          style={{
            position: "absolute",
            left: 8,
            top: 0,
            bottom: 0,
            width: 2,
            background: "var(--border)",
          }}
        />
        {filtered.map((t) => {
          const isExp = expanded === t.id;
          const dotColor = TYPE_COLORS[t.type] || "var(--muted)";
          return (
            <div key={t.id} style={{ position: "relative", marginBottom: 14 }}>
              <div
                style={{
                  position: "absolute",
                  left: -19,
                  top: 12,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: dotColor,
                  border: "2px solid var(--surface)",
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "11px 14px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                  onClick={() => setExpanded(isExp ? null : t.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: dotColor,
                          textTransform: "uppercase",
                          letterSpacing: ".05em",
                        }}
                      >
                        {t.type}
                      </span>
                      {t.ticker && (
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--accent)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 13,
                          }}
                        >
                          {t.ticker}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 13,
                          color: "var(--text)",
                          fontWeight: 500,
                        }}
                      >
                        {t.asset}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--muted)",
                          padding: "1px 7px",
                          border: "1px solid var(--border)",
                          borderRadius: 99,
                        }}
                      >
                        {t.category}
                      </span>
                    </div>
                    {t.notes && !isExp && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--muted)",
                          marginTop: 4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 500,
                        }}
                      >
                        {t.notes}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 3,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {t.date}
                    </span>
                    {t.amount > 0 && (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color:
                            t.type === "sell" ? "var(--loss)" : "var(--gain)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {t.type === "sell" ? "-" : "+"}
                        {fmt(t.amount)}
                      </span>
                    )}
                  </div>
                </div>
                {isExp && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderTop: "1px solid var(--border)",
                      background: "var(--surface)",
                    }}
                  >
                    {t.notes && (
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--text)",
                          lineHeight: 1.6,
                          marginBottom: 10,
                        }}
                      >
                        {t.notes}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                      {t.price && (
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          Price:{" "}
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "var(--text)",
                            }}
                          >
                            ₹{t.price}
                          </span>
                        </div>
                      )}
                      {t.qty && (
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          Qty:{" "}
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "var(--text)",
                            }}
                          >
                            {t.qty}
                          </span>
                        </div>
                      )}
                      {t.amount > 0 && (
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          Amount:{" "}
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "var(--text)",
                            }}
                          >
                            {fmt(t.amount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div
          style={{ padding: 60, textAlign: "center", color: "var(--muted)" }}
        >
          <Icon name="note" size={36} color="var(--border)" />
          <div style={{ marginTop: 12, fontSize: 14 }}>
            No journal entries match your filter
          </div>
        </div>
      )}
    </div>
  );
}
