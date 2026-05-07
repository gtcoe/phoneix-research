"use client";
import { useState } from "react";
import { fmt, fmtPct } from "@/lib/formatters";
import { Badge, ConvictionDot, Gain, Icon } from "@/components/ui";
import type { PhoenixData } from "@/types";
import {
  STATUS_OPTIONS,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/constants/watchlist";
import type { WatchStatus } from "@/constants/watchlist";

type WatchItem = PhoenixData["watchlist"][number];

export function WatchCard({
  item,
  onStatusChange,
  onRemove,
  onThesisSave,
}: {
  item: WatchItem;
  onStatusChange: (id: string, status: WatchStatus) => void;
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

  const startEditing = () => {
    setThesisVal(item.thesis || "");
    setEditingThesis(true);
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden transition-colors duration-150">
      {/* Card header */}
      <div className="py-3.5 px-4 border-b border-[var(--border)]">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[var(--accent)] font-[var(--font-mono)]">
                {item.ticker}
              </span>
              <span className="text-[11px] text-[var(--muted)]">
                {item.exchange}
              </span>
              <Badge rec={item.rec} size="xs" />
            </div>
            <div className="text-xs text-[var(--text)] mt-[3px]">
              {item.name}
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">
              {item.sector} · {item.mcap}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <ConvictionDot score={item.conviction} />
            <span
              className="text-[11px] py-0.5 px-2 rounded-full bg-[var(--surface)] font-semibold"
              style={{
                color: STATUS_COLORS[item.status as WatchStatus] || "var(--muted)",
                border: `1px solid ${STATUS_COLORS[item.status as WatchStatus] || "var(--border)"}`,
              }}
            >
              {STATUS_LABELS[item.status as WatchStatus] || item.status}
            </span>
          </div>
        </div>
      </div>

      {/* Price info */}
      <div className="py-3 px-4 grid grid-cols-3 gap-2">
        <div>
          <div className="text-[10px] text-[var(--muted)] mb-0.5">
            Current
          </div>
          <div className="text-sm font-bold text-[var(--text)] font-[var(--font-mono)]">
            ₹{item.currentPrice.toFixed(2)}
          </div>
          <div
            className={`text-[11px] font-[var(--font-mono)] ${
              priceDiffPct >= 0 ? "text-[var(--gain)]" : "text-[var(--loss)]"
            }`}
          >
            {priceDiffPct >= 0 ? "+" : ""}
            {priceDiffPct.toFixed(1)}% since add
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--muted)] mb-0.5">
            Added At
          </div>
          <div className="text-sm text-[var(--text)] font-[var(--font-mono)]">
            ₹{item.priceAtAdd.toFixed(2)}
          </div>
          <div className="text-[10px] text-[var(--muted)]">
            {item.addedDate}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--muted)] mb-0.5">
            Alert
          </div>
          {item.alertPrice ? (
            <>
              <div className="text-sm text-[var(--text)] font-[var(--font-mono)]">
                ₹{item.alertPrice.toFixed(2)}
              </div>
              <div
                className={`text-[11px] font-[var(--font-mono)] ${
                  toAlert! <= 0 ? "text-[var(--gain)]" : "text-[var(--muted)]"
                }`}
              >
                {toAlert! <= 0
                  ? "🔔 Triggered"
                  : `${toAlert!.toFixed(1)}% away`}
              </div>
            </>
          ) : (
            <div className="text-xs text-[var(--muted)]">—</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 px-4 pb-3 flex gap-2 items-center flex-wrap">
        <select
          value={item.status}
          onChange={(e) => onStatusChange(item.id, e.target.value as WatchStatus)}
          className="py-1 px-2 bg-[var(--bg)] border border-[var(--border)] rounded-md text-[var(--text)] text-xs cursor-pointer"
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
            className="flex items-center gap-1 text-xs text-[var(--accent)] no-underline py-1 px-[10px] border border-[var(--border)] rounded-md"
          >
            <Icon name="external" size={12} />
            Report
          </a>
        )}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="ml-auto py-1 px-[10px] bg-transparent border border-[var(--border)] rounded-md cursor-pointer text-xs text-[var(--muted)]"
        >
          {expanded ? "Hide" : "Thesis"}
        </button>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.ticker} from watchlist`}
          className="p-1 bg-transparent border-none cursor-pointer text-[var(--muted)] flex"
        >
          <Icon name="trash" size={14} />
        </button>
      </div>

      {/* Expanded thesis */}
      {expanded && (
        <div className="py-3 px-4 border-t border-[var(--border)] bg-[var(--surface)]">
          {editingThesis ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={thesisVal}
                onChange={(e) => setThesisVal(e.target.value)}
                rows={4}
                className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-md text-[var(--text)] text-xs resize-y box-border"
                style={{ fontFamily: "inherit" }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveThesis}
                  className="py-[5px] px-3.5 bg-[var(--accent)] border-none rounded-md text-white cursor-pointer text-xs"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setThesisVal(item.thesis || "");
                    setEditingThesis(false);
                  }}
                  className="py-[5px] px-3.5 bg-[var(--surface2)] border border-[var(--border)] rounded-md text-[var(--muted)] cursor-pointer text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* M4: thesis edit area — proper keyboard-accessible interactive element */
            <div
              role="button"
              tabIndex={0}
              onClick={startEditing}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  startEditing();
                }
              }}
              aria-label="Click to edit thesis"
              className="cursor-text outline-none"
            >
              <div className="text-xs text-[var(--text)] leading-relaxed">
                {item.thesis || (
                  <span className="text-[var(--muted)] italic">
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
