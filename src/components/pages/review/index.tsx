"use client";
import { useState } from "react";
import { fmt } from "@/lib/formatters";
import { Icon } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import type { PhoenixData } from "@/types";
import { ReviewCard } from "./ReviewCard";

import { QUARTERS } from "@/constants/review";
import type { Quarter } from "@/constants/review";

export default function QuarterlyReview({ data }: { data: PhoenixData }) {
  // QUARTERS loaded from constants (future: from GET /api/v1/reviews/quarters via reviewService)
  const [quarter, setQuarter] = useState<Quarter>("Q4 FY26");
  const { show: showToast } = useToast();

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
        showToast("Review saved ✓", "success");
      }
      next.set(quarter, qSet);
      return next;
    });
  };

  const equityAssets = data.assets.filter((a) => a.rec);
  const progress =
    equityAssets.length > 0
      ? Math.round((quarterReviewed.size / equityAssets.length) * 100)
      : 0;

  return (
    <div className="p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)] m-0">
            Quarterly Review
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1 mb-0">
            Review each position and update your thesis
          </p>
        </div>
        <div className="flex gap-2">
          {QUARTERS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuarter(q)}
              className={`py-1.5 px-3.5 rounded-lg border border-[var(--border)] cursor-pointer text-xs font-medium ${
                quarter === q
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface)] text-[var(--muted)]"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-4 px-5 mb-5">
        <div className="flex justify-between items-center mb-[10px]">
          <div className="text-sm font-semibold text-[var(--text)]">
            {quarter} Progress
          </div>
          <div className="text-sm font-[var(--font-mono)] text-[var(--accent)]">
            {quarterReviewed.size} / {equityAssets.length} reviewed
          </div>
        </div>
        <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] rounded-full"
            style={{ width: `${progress}%`, transition: "width .4s ease" }}
          />
        </div>
        <div className="flex gap-5 mt-3 flex-wrap">
          {[
            { label: "Total Positions", value: equityAssets.length },
            { label: "Reviewed", value: quarterReviewed.size },
            { label: "Remaining", value: equityAssets.length - quarterReviewed.size },
            { label: "Net Worth", value: fmt(data.netWorth) },
          ].map((m) => (
            <div key={m.label}>
              <div className="text-[10px] text-[var(--muted)] mb-0.5">
                {m.label}
              </div>
              <div className="text-base font-bold text-[var(--text)] font-[var(--font-mono)]">
                {m.value}
              </div>
            </div>
          ))}
        </div>
        {/* Action summary */}
        <div className="mt-3.5 flex gap-2">
          {[
            { label: "Buy", icon: "↑", color: "var(--gain)" },
            { label: "Hold", icon: "→", color: "var(--warn)" },
            { label: "Trim", icon: "↓", color: "var(--accent)" },
            { label: "Exit", icon: "✕", color: "var(--loss)" },
          ].map((a) => (
            <div
              key={a.label}
              className="py-1.5 px-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs"
            >
              <span className="font-bold mr-1" style={{ color: a.color }}>
                {a.icon}
              </span>
              <span className="text-[var(--muted)]">{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review cards */}
      {equityAssets.length === 0 ? (
        <div className="p-20 text-center text-[var(--muted)]">
          <Icon name="review" size={40} color="var(--border)" />
          <div className="mt-4 text-base font-semibold text-[var(--text)]">
            No positions to review yet
          </div>
          <div className="mt-1.5 text-sm">
            Add equity holdings in your portfolio to start quarterly reviews
          </div>
        </div>
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))" }}
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
