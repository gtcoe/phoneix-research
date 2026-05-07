"use client";
import { THRESHOLDS } from "@/constants/thresholds";
import { useState } from "react";
import { fmt, fmtPct } from "@/lib/formatters";
import { Badge, ConvictionDot, Gain, Icon } from "@/components/ui";
import type { PhoenixData } from "@/types";

type Asset = PhoenixData["assets"][number];

export function ReviewCard({
  asset,
  isReviewed,
  onComplete,
}: {
  asset: Asset;
  isReviewed: boolean;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    thesisHolding: "",
    result: "",
    newConviction: asset.conviction ?? 7,
    action: "hold" as "hold" | "add" | "trim" | "exit",
  });

  const STEPS = ["Thesis Check", "Result", "Conviction Delta", "Action"];

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="py-3 px-4 border-b border-[var(--border)] flex justify-between items-center gap-2">
        {/* Left: ticker + name + badge + conviction */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0">
            <div className="text-sm font-bold text-[var(--accent)] font-[var(--font-mono)] whitespace-nowrap">
              {asset.ticker ?? asset.category}
            </div>
            <div className="text-[11px] text-[var(--muted)] truncate max-w-[140px]">
              {asset.name.slice(0, 22)}
            </div>
          </div>
          {asset.rec && <Badge rec={asset.rec} size="xs" />}
          {asset.conviction != null && (
            <ConvictionDot score={asset.conviction} />
          )}
        </div>
        {/* Right: gain + mark done */}
        <div className="flex items-center gap-[10px] shrink-0">
          <Gain value={asset.gain} pct={asset.gainPct} />
          <button
            type="button"
            onClick={onComplete}
            className={`py-[3px] px-[10px] text-[11px] font-semibold rounded-full cursor-pointer whitespace-nowrap ${
              isReviewed
                ? "bg-[var(--gain)] text-white"
                : "bg-[var(--surface)] text-[var(--muted)]"
            }`}
            style={{ border: `1px solid ${isReviewed ? "var(--gain)" : "var(--border)"}` }}
          >
            {isReviewed ? "✓ Done" : "Mark Done"}
          </button>
        </div>
      </div>

      {/* Step progress */}
      <div className="py-[10px] px-4 border-b border-[var(--border)] bg-[var(--surface)] flex gap-1">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className="flex items-center"
            style={{ flex: i < STEPS.length - 1 ? 1 : "none" }}
          >
            <div
              className="flex items-center gap-[5px] cursor-pointer"
              onClick={() => setStep(i)}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  i <= step ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                }`}
              >
                <span
                  className={`text-[10px] font-bold ${
                    i <= step ? "text-white" : "text-[var(--muted)]"
                  }`}
                >
                  {i + 1}
                </span>
              </div>
              <span
                className={`text-[11px] whitespace-nowrap ${
                  i === step ? "text-[var(--text)]" : "text-[var(--muted)]"
                }`}
              >
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-1.5 ${
                  i < step ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="py-3.5 px-4">
        {step === 0 && (
          <div>
            <div className="text-xs text-[var(--muted)] mb-2">
              Is the original thesis still intact? What has changed?
            </div>
            {asset.targetNote && (
              <div className="text-xs text-[var(--text)] bg-[var(--surface)] py-2 px-[10px] rounded-md mb-[10px] leading-relaxed border-l-[3px] border-l-[var(--accent)]">
                {asset.targetNote}
              </div>
            )}
            <textarea
              value={data.thesisHolding}
              onChange={(e) =>
                setData((d) => ({ ...d, thesisHolding: e.target.value }))
              }
              rows={3}
              placeholder="Thesis still holds because…"
              className="w-full py-2 px-[10px] bg-[var(--bg)] border border-[var(--border)] rounded-md text-[var(--text)] text-xs resize-y box-border"
              style={{ fontFamily: "inherit" }}
            />
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="text-xs text-[var(--muted)] mb-2">
              How did the stock perform vs expectations?
            </div>
            <div className="grid grid-cols-2 gap-[10px] mb-[10px]">
              {(
                [
                { label: "Entry Price", value: fmt(asset.entryPrice) },
                { label: "Current Price", value: fmt(asset.currentPrice) },
                {
                  label: "Total Gain",
                  value: fmt(asset.gain),
                  color: asset.gain >= 0 ? "var(--gain)" : "var(--loss)",
                },
                {
                  label: "XIRR",
                  value: asset.xirr != null ? `${asset.xirr.toFixed(1)}%` : "—",
                  color:
                    (asset.xirr ?? 0) >= THRESHOLDS.GOOD_XIRR ? "var(--gain)" : "var(--warn)",
                },
              ] as Array<{ label: string; value: string; color?: string }>
              ).map((m) => (
                <div
                  key={m.label}
                  className="bg-[var(--surface)] py-2 px-3 rounded-md"
                >
                  <div className="text-[10px] text-[var(--muted)]">
                    {m.label}
                  </div>
                  <div
                    className="text-sm font-bold font-[var(--font-mono)] mt-0.5"
                    style={{ color: m.color || "var(--text)" }}
                  >
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
            <textarea
              value={data.result}
              onChange={(e) =>
                setData((d) => ({ ...d, result: e.target.value }))
              }
              rows={2}
              placeholder="Result notes…"
              className="w-full py-2 px-[10px] bg-[var(--bg)] border border-[var(--border)] rounded-md text-[var(--text)] text-xs resize-y box-border"
              style={{ fontFamily: "inherit" }}
            />
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="text-xs text-[var(--muted)] mb-3">
              Update your conviction score (1–10)
            </div>
            <div className="flex items-center gap-3.5 mb-3">
              <span className="text-xs text-[var(--muted)]">
                Previous: <ConvictionDot score={asset.conviction} />
              </span>
              <span className="text-xs text-[var(--muted)]">New:</span>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={data.newConviction}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    newConviction: Number(e.target.value),
                  }))
                }
                className="flex-1"
              />
              <ConvictionDot score={data.newConviction} />
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="text-xs text-[var(--muted)] mb-3">
              What action will you take?
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(["hold", "add", "trim", "exit"] as const).map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => setData((d) => ({ ...d, action: a }))}
                  className={`py-[10px] px-1.5 rounded-lg cursor-pointer text-sm font-semibold capitalize ${
                    data.action === a
                      ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                      : "bg-[var(--surface)] text-[var(--muted)]"
                  }`}
                  style={{ border: `1px solid ${data.action === a ? "var(--accent)" : "var(--border)"}` }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={`py-1.5 px-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-md text-[var(--muted)] text-xs ${
              step === 0 ? "cursor-not-allowed opacity-40" : "cursor-pointer opacity-100"
            }`}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (step === STEPS.length - 1) {
                onComplete();
              } else {
                setStep((s) => Math.min(STEPS.length - 1, s + 1));
              }
            }}
            className={`py-1.5 px-3.5 border-none rounded-md cursor-pointer text-white text-xs font-semibold ${
              step === STEPS.length - 1 ? "bg-[var(--gain)]" : "bg-[var(--accent)]"
            }`}
          >
            {step === STEPS.length - 1 ? "Complete Review" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
