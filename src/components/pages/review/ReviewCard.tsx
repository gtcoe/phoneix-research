"use client";
import { THRESHOLDS } from "@/constants/thresholds";
import { useState } from "react";
import { fmt, fmtPct } from "@/lib/formatters";
import { Badge, ConvictionDot, Gain, Icon } from "@/components/ui";
import type { PhoenixData } from "@/lib/data";

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
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Left: ticker + name + badge + conviction */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--accent)",
                fontFamily: "var(--font-mono)",
                whiteSpace: "nowrap",
              }}
            >
              {asset.ticker ?? asset.category}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 140,
              }}
            >
              {asset.name.slice(0, 22)}
            </div>
          </div>
          {asset.rec && <Badge rec={asset.rec} size="xs" />}
          {asset.conviction != null && (
            <ConvictionDot score={asset.conviction} />
          )}
        </div>
        {/* Right: gain + mark done */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <Gain value={asset.gain} pct={asset.gainPct} />
          <button
            onClick={onComplete}
            style={{
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 600,
              background: isReviewed ? "var(--gain)" : "var(--surface)",
              border: `1px solid ${isReviewed ? "var(--gain)" : "var(--border)"}`,
              borderRadius: 99,
              cursor: "pointer",
              color: isReviewed ? "#fff" : "var(--muted)",
              whiteSpace: "nowrap",
            }}
          >
            {isReviewed ? "✓ Done" : "Mark Done"}
          </button>
        </div>
      </div>

      {/* Step progress */}
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          display: "flex",
          gap: 4,
        }}
      >
        {STEPS.map((s, i) => (
          <div
            key={s}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < STEPS.length - 1 ? 1 : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                cursor: "pointer",
              }}
              onClick={() => setStep(i)}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: i <= step ? "var(--accent)" : "var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: i <= step ? "#fff" : "var(--muted)",
                  }}
                >
                  {i + 1}
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: i === step ? "var(--text)" : "var(--muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: i < step ? "var(--accent)" : "var(--border)",
                  margin: "0 6px",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div style={{ padding: "14px 16px" }}>
        {step === 0 && (
          <div>
            <div
              style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}
            >
              Is the original thesis still intact? What has changed?
            </div>
            {asset.targetNote && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text)",
                  background: "var(--surface)",
                  padding: "8px 10px",
                  borderRadius: 6,
                  marginBottom: 10,
                  lineHeight: 1.6,
                  borderLeft: "3px solid var(--accent)",
                }}
              >
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
              style={{
                width: "100%",
                padding: "8px 10px",
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
          </div>
        )}
        {step === 1 && (
          <div>
            <div
              style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}
            >
              How did the stock perform vs expectations?
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 10,
              }}
            >
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
                  style={{
                    background: "var(--surface)",
                    padding: "8px 12px",
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: m.color || "var(--text)",
                      fontFamily: "var(--font-mono)",
                      marginTop: 2,
                    }}
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
              style={{
                width: "100%",
                padding: "8px 10px",
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
          </div>
        )}
        {step === 2 && (
          <div>
            <div
              style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}
            >
              Update your conviction score (1–10)
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                Previous: <ConvictionDot score={asset.conviction} />
              </span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>New:</span>
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
                style={{ flex: 1 }}
              />
              <ConvictionDot score={data.newConviction} />
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <div
              style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}
            >
              What action will you take?
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
              }}
            >
              {(["hold", "add", "trim", "exit"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setData((d) => ({ ...d, action: a }))}
                  style={{
                    padding: "10px 6px",
                    borderRadius: 8,
                    border: `1px solid ${data.action === a ? "var(--accent)" : "var(--border)"}`,
                    background:
                      data.action === a
                        ? "var(--accent-dim)"
                        : "var(--surface)",
                    cursor: "pointer",
                    color: data.action === a ? "var(--accent)" : "var(--muted)",
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{
              padding: "6px 14px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              cursor: step === 0 ? "not-allowed" : "pointer",
              color: "var(--muted)",
              fontSize: 12,
              opacity: step === 0 ? 0.4 : 1,
            }}
          >
            Back
          </button>
          <button
            onClick={() => {
              if (step === STEPS.length - 1) {
                onComplete();
              } else {
                setStep((s) => Math.min(STEPS.length - 1, s + 1));
              }
            }}
            style={{
              padding: "6px 14px",
              background:
                step === STEPS.length - 1 ? "var(--gain)" : "var(--accent)",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {step === STEPS.length - 1 ? "Complete Review" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
