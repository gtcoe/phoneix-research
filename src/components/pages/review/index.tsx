// @ts-nocheck
"use client";
import { useState } from "react";
import { fmt } from "@/lib/formatters";
import { Icon } from "@/components/ui";
import type { PhoenixData } from "@/lib/data";
import { ReviewCard } from "./ReviewCard";

export default function QuarterlyReview({ data }: { data: PhoenixData }) {
  // Derive available quarters from mock data (backend returns a list via GET /api/v1/reviews/quarters)
  const QUARTERS = ["Q3 FY26", "Q4 FY26"];
  const [quarter, setQuarter] = useState("Q4 FY26");
  const [toast, setToast] = useState<string | null>(null);

  // Per-quarter reviewed set — pre-populate from data.quarterlyReviews (backend seed)
  const [reviewedByQuarter, setReviewedByQuarter] = useState<
    Map<string, Set<number>>
  >(() => {
    const m = new Map<string, Set<number>>();
    (data.quarterlyReviews ?? []).forEach((r) => {
      if (!m.has(r.quarter)) m.set(r.quarter, new Set());
      m.get(r.quarter)!.add(r.assetId);
    });
    return m;
  });

  const quarterReviewed = reviewedByQuarter.get(quarter) ?? new Set<number>();

  const markReviewed = (id: number) => {
    setReviewedByQuarter((prev) => {
      const next = new Map(prev);
      const qSet = new Set(next.get(quarter) ?? []);
      if (qSet.has(id)) {
        qSet.delete(id);
      } else {
        qSet.add(id);
        showToast("Review saved ✓");
      }
      next.set(quarter, qSet);
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const equityAssets = data.assets.filter((a) => a.rec);
  const progress =
    equityAssets.length > 0
      ? Math.round((quarterReviewed.size / equityAssets.length) * 100)
      : 0;

  return (
    <div style={{ padding: 24, position: "relative" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            background: "var(--gain)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 13,
            zIndex: 9999,
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            Quarterly Review
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>
            Review each position and update your thesis
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {QUARTERS.map((q) => (
            <button
              key={q}
              onClick={() => setQuarter(q)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: quarter === q ? "var(--accent)" : "var(--surface)",
                color: quarter === q ? "#fff" : "var(--muted)",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
            {quarter} Progress
          </div>
          <div
            style={{
              fontSize: 13,
              fontFamily: "var(--font-mono)",
              color: "var(--accent)",
            }}
          >
            {quarterReviewed.size} / {equityAssets.length} reviewed
          </div>
        </div>
        <div
          style={{
            height: 8,
            background: "var(--border)",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "var(--accent)",
              borderRadius: 99,
              transition: "width .4s ease",
            }}
          />
        </div>
        <div
          style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}
        >
          {[
            { label: "Total Positions", value: equityAssets.length },
            { label: "Reviewed", value: quarterReviewed.size },
            { label: "Remaining", value: equityAssets.length - quarterReviewed.size },
            { label: "Net Worth", value: fmt(data.netWorth) },
          ].map((m) => (
            <div key={m.label}>
              <div
                style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2 }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>
        {/* Action summary */}
        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          {[
            { label: "Buy", icon: "↑", color: "var(--gain)" },
            { label: "Hold", icon: "→", color: "var(--warn)" },
            { label: "Trim", icon: "↓", color: "var(--accent)" },
            { label: "Exit", icon: "✕", color: "var(--loss)" },
          ].map((a) => (
            <div
              key={a.label}
              style={{
                padding: "6px 14px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            >
              <span style={{ color: a.color, fontWeight: 700, marginRight: 4 }}>
                {a.icon}
              </span>
              <span style={{ color: "var(--muted)" }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review cards */}
      {equityAssets.length === 0 ? (
        <div
          style={{
            padding: 80,
            textAlign: "center",
            color: "var(--muted)",
          }}
        >
          <Icon name="review" size={40} color="var(--border)" />
          <div style={{ marginTop: 16, fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
            No positions to review yet
          </div>
          <div style={{ marginTop: 6, fontSize: 13 }}>
            Add equity holdings in your portfolio to start quarterly reviews
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: 16,
          }}
        >
          {equityAssets.map((a) => (
            <div key={a.id}>
              <ReviewCard
                asset={a}
                isReviewed={quarterReviewed.has(a.id)}
                onComplete={() => markReviewed(a.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
