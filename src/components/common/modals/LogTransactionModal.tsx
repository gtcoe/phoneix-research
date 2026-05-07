"use client";
import { useState } from "react";
import { Icon } from "@/components/ui";
import type { PhoenixData } from "@/types";

type Asset = PhoenixData["assets"][number];

interface LogTransactionModalProps {
  assets: Asset[];
  onClose: () => void;
  defaultTicker?: string;
}

const TX_TYPES = [
  { value: "BUY", label: "Buy", color: "var(--gain)" },
  { value: "SELL", label: "Sell", color: "var(--loss)" },
  { value: "DIVIDEND", label: "Dividend", color: "var(--info)" },
];


export default function LogTransactionModal({
  assets,
  onClose,
  defaultTicker = "",
}: LogTransactionModalProps) {
  const [txType, setTxType] = useState("BUY");
  const [ticker, setTicker] = useState(defaultTicker);
  const [isNew, setIsNew] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [date, setDate] = useState(() => {
    const now = new Date();
    return `${now.toLocaleString("default", { month: "short" })} ${now.getFullYear()}`;
  });
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const equityTickers = assets
    .filter((a) => a.ticker)
    .map((a) => ({ ticker: a.ticker!, name: a.name, category: a.category }));

  const amount =
    qty && price
      ? (parseFloat(qty) * parseFloat(price)).toFixed(0)
      : "";

  const needsQtyPrice = txType === "BUY" || txType === "SELL";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/55 z-[1000] flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-[var(--card)] border border-[var(--border)] rounded-[14px] py-10 px-8 w-full max-w-[480px] max-h-[90vh] overflow-y-auto text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full bg-[var(--gain-dim,rgba(34,197,94,.15))] flex items-center justify-center mx-auto mb-4">
            <Icon name="check" size={22} color="var(--gain)" />
          </div>
          <div className="text-base font-bold text-[var(--text)] mb-2">
            Transaction logged
          </div>
          <div className="text-xs text-[var(--muted)] mb-6">
            {txType} · {ticker || assetName} · {date}
            {amount ? ` · ₹${parseInt(amount).toLocaleString("en-IN")}` : ""}
            <br />
            <span className="opacity-70">
              Will be persisted to the backend when connected.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-6 bg-[var(--accent)] border-0 rounded-lg text-white font-semibold text-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/55 z-[1000] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--card)] border border-[var(--border)] rounded-[14px] py-6 px-7 w-full max-w-[480px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-base font-bold text-[var(--text)]">
            Log Transaction
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-0 cursor-pointer text-[var(--muted)] p-1"
          >
            <Icon name="x" size={16} color="var(--muted)" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Transaction type */}
          <div className="mb-4">
            <label className="text-[11px] font-semibold text-[var(--muted)] tracking-[.05em] uppercase mb-[5px] block">Type</label>
            <div className="flex gap-2">
              {TX_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTxType(t.value)}
                  className="flex-1 py-2 px-0 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-150"
                  style={{
                    border: `1px solid ${txType === t.value ? t.color : "var(--border)"}`,
                    background:
                      txType === t.value
                        ? `color-mix(in srgb, ${t.color} 15%, transparent)`
                        : "var(--surface)",
                    color: txType === t.value ? t.color : "var(--muted)",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Asset */}
          <div className="mb-4">
            <label className="text-[11px] font-semibold text-[var(--muted)] tracking-[.05em] uppercase mb-[5px] block">Asset</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setIsNew(false)}
                className="flex-1 py-1.5 px-0 rounded-md text-xs font-semibold cursor-pointer"
                style={{
                  border: `1px solid ${!isNew ? "var(--accent)" : "var(--border)"}`,
                  background: !isNew ? "var(--accent-dim)" : "var(--surface)",
                  color: !isNew ? "var(--accent)" : "var(--muted)",
                }}
              >
                Existing holding
              </button>
              <button
                type="button"
                onClick={() => setIsNew(true)}
                className="flex-1 py-1.5 px-0 rounded-md text-xs font-semibold cursor-pointer"
                style={{
                  border: `1px solid ${isNew ? "var(--accent)" : "var(--border)"}`,
                  background: isNew ? "var(--accent-dim)" : "var(--surface)",
                  color: isNew ? "var(--accent)" : "var(--muted)",
                }}
              >
                New position
              </button>
            </div>
            {isNew ? (
              <div className="flex gap-2">
                <input
                  className="py-2 px-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] text-sm outline-none w-full box-border flex-1"
                  placeholder="Ticker (e.g. SKYGOLD)"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  required
                />
                <input
                  className="py-2 px-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] text-sm outline-none w-full box-border"
                  style={{ flex: 2 }}
                  placeholder="Company name"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  required
                />
              </div>
            ) : (
              <select
                className="py-2 px-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] text-sm outline-none w-full box-border"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                required
              >
                <option value="">— Select holding —</option>
                {equityTickers.map((a) => (
                  <option key={a.ticker} value={a.ticker}>
                    {a.ticker} · {a.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="text-[11px] font-semibold text-[var(--muted)] tracking-[.05em] uppercase mb-[5px] block">Date</label>
            <input
              className="py-2 px-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] text-sm outline-none w-full box-border"
              placeholder="e.g. Apr 2025"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Qty + Price (equity transactions) */}
          {needsQtyPrice && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[11px] font-semibold text-[var(--muted)] tracking-[.05em] uppercase mb-[5px] block">Quantity</label>
                <input
                  className="py-2 px-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] text-sm outline-none w-full box-border"
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="0"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[var(--muted)] tracking-[.05em] uppercase mb-[5px] block">Price per unit (₹)</label>
                <input
                  className="py-2 px-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] text-sm outline-none w-full box-border"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Dividend amount */}
          {txType === "DIVIDEND" && (
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-[var(--muted)] tracking-[.05em] uppercase mb-[5px] block">Dividend amount (₹)</label>
              <input
                className="py-2 px-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] text-sm outline-none w-full box-border"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          )}

          {/* Computed total */}
          {amount && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg py-[10px] px-3.5 mb-4 flex justify-between items-center">
              <span className="text-xs text-[var(--muted)]">
                Total amount
              </span>
              <span
                className={`text-sm font-bold font-[var(--font-mono)] ${txType === "BUY" ? "text-[var(--loss)]" : "text-[var(--gain)]"}`}
              >
                {txType === "BUY" ? "-" : "+"}₹
                {parseInt(amount).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {/* Notes */}
          <div className="mb-5">
            <label className="text-[11px] font-semibold text-[var(--muted)] tracking-[.05em] uppercase mb-[5px] block">Notes / Reasoning</label>
            <textarea
              className="py-2 px-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] text-sm outline-none w-full box-border min-h-[72px] resize-y font-[inherit]"
              placeholder="Why are you making this transaction? (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-[10px]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-[10px] px-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-[10px] px-0 rounded-lg border-0 bg-[var(--accent)] text-white text-sm font-bold cursor-pointer"
              style={{ flex: 2 }}
            >
              Log Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

