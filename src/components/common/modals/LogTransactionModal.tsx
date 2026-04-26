"use client";
import { useState } from "react";
import { Icon } from "@/components/ui";
import type { PhoenixData } from "@/lib/data";

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

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--muted)",
  letterSpacing: ".05em",
  textTransform: "uppercase",
  marginBottom: 5,
  display: "block",
};

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
      <div style={overlayStyle} onClick={onClose}>
        <div
          style={{ ...modalStyle, textAlign: "center", padding: "40px 32px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "var(--gain-dim, rgba(34,197,94,.15))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Icon name="check" size={22} color="var(--gain)" />
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 8,
            }}
          >
            Transaction logged
          </div>
          <div
            style={{ fontSize: 12, color: "var(--muted)", marginBottom: 24 }}
          >
            {txType} · {ticker || assetName} · {date}
            {amount ? ` · ₹${parseInt(amount).toLocaleString("en-IN")}` : ""}
            <br />
            <span style={{ opacity: 0.7 }}>
              Will be persisted to the backend when connected.
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px 24px",
              background: "var(--accent)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div
            style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}
          >
            Log Transaction
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              padding: 4,
            }}
          >
            <Icon name="x" size={16} color="var(--muted)" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Transaction type */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Type</label>
            <div style={{ display: "flex", gap: 8 }}>
              {TX_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTxType(t.value)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 8,
                    border: `1px solid ${txType === t.value ? t.color : "var(--border)"}`,
                    background:
                      txType === t.value
                        ? `color-mix(in srgb, ${t.color} 15%, transparent)`
                        : "var(--surface)",
                    color: txType === t.value ? t.color : "var(--muted)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Asset */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Asset</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => setIsNew(false)}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  borderRadius: 6,
                  border: `1px solid ${!isNew ? "var(--accent)" : "var(--border)"}`,
                  background: !isNew ? "var(--accent-dim)" : "var(--surface)",
                  color: !isNew ? "var(--accent)" : "var(--muted)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Existing holding
              </button>
              <button
                type="button"
                onClick={() => setIsNew(true)}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  borderRadius: 6,
                  border: `1px solid ${isNew ? "var(--accent)" : "var(--border)"}`,
                  background: isNew ? "var(--accent-dim)" : "var(--surface)",
                  color: isNew ? "var(--accent)" : "var(--muted)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                New position
              </button>
            </div>
            {isNew ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Ticker (e.g. SKYGOLD)"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  required
                />
                <input
                  style={{ ...inputStyle, flex: 2 }}
                  placeholder="Company name"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  required
                />
              </div>
            ) : (
              <select
                style={inputStyle}
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
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Date</label>
            <input
              style={inputStyle}
              placeholder="e.g. Apr 2025"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Qty + Price (equity transactions) */}
          {needsQtyPrice && (
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}
            >
              <div>
                <label style={labelStyle}>Quantity</label>
                <input
                  style={inputStyle}
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
                <label style={labelStyle}>Price per unit (₹)</label>
                <input
                  style={inputStyle}
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
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Dividend amount (₹)</label>
              <input
                style={inputStyle}
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
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                Total amount
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color:
                    txType === "BUY" ? "var(--loss)" : "var(--gain)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {txType === "BUY" ? "-" : "+"}₹
                {parseInt(amount).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Notes / Reasoning</label>
            <textarea
              style={{
                ...inputStyle,
                minHeight: 72,
                resize: "vertical",
                fontFamily: "inherit",
              }}
              placeholder="Why are you making this transaction? (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--muted)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 2,
                padding: "10px 0",
                borderRadius: 8,
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Log Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const modalStyle: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: "24px 28px",
  width: "100%",
  maxWidth: 480,
  maxHeight: "90vh",
  overflowY: "auto",
};
