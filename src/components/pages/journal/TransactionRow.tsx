import { fmt } from "@/lib/formatters";
import type { Transaction } from "@/types/transaction";

const TYPE_COLORS: Record<string, string> = {
  buy: "var(--gain)",
  sell: "var(--loss)",
  add: "var(--gain)",
  note: "var(--info)",
  thesis: "var(--accent)",
  milestone: "var(--warn)",
};

interface Props {
  transaction: Transaction;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function TransactionRow({
  transaction: t,
  isExpanded,
  onToggle,
}: Props) {
  const dotColor = TYPE_COLORS[t.type] || "var(--muted)";

  return (
    <div style={{ position: "relative", marginBottom: 14 }}>
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
          onClick={onToggle}
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
            {t.notes && !isExpanded && (
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
                  color: t.type === "sell" ? "var(--loss)" : "var(--gain)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {t.type === "sell" ? "-" : "+"}
                {fmt(t.amount)}
              </span>
            )}
          </div>
        </div>
        {isExpanded && (
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
}
