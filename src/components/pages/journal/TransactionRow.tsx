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
    <div className="relative mb-3.5">
      <div
        className="absolute -left-[19px] top-3 w-[10px] h-[10px] rounded-full border-2 border-[var(--surface)] z-[1]"
        style={{ background: dotColor }}
      />
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[10px] overflow-hidden">
        <div
          className="py-[11px] px-3.5 cursor-pointer flex justify-between items-start gap-3"
          onClick={onToggle}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[11px] font-bold uppercase tracking-[.05em]"
                style={{ color: dotColor }}
              >
                {t.type}
              </span>
              {t.ticker && (
                <span className="font-semibold text-[var(--accent)] font-[var(--font-mono)] text-sm">
                  {t.ticker}
                </span>
              )}
              <span className="text-sm text-[var(--text)] font-medium">
                {t.asset}
              </span>
              <span className="text-[11px] text-[var(--muted)] py-px px-[7px] border border-[var(--border)] rounded-full">
                {t.category}
              </span>
            </div>
            {t.notes && !isExpanded && (
              <div className="text-xs text-[var(--muted)] mt-1 overflow-hidden text-ellipsis whitespace-nowrap max-w-[500px]">
                {t.notes}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-[3px] shrink-0">
            <span className="text-[11px] text-[var(--muted)] font-[var(--font-mono)]">
              {t.date}
            </span>
            {t.amount > 0 && (
              <span
                className="text-xs font-semibold font-[var(--font-mono)]"
                style={{ color: t.type === "sell" ? "var(--loss)" : "var(--gain)" }}
              >
                {t.type === "sell" ? "-" : "+"}
                {fmt(t.amount)}
              </span>
            )}
          </div>
        </div>
        {isExpanded && (
          <div className="py-[10px] px-3.5 border-t border-[var(--border)] bg-[var(--surface)]">
            {t.notes && (
              <div className="text-sm text-[var(--text)] leading-relaxed mb-2.5">
                {t.notes}
              </div>
            )}
            <div className="flex gap-5 flex-wrap">
              {t.price && (
                <div className="text-xs text-[var(--muted)]">
                  Price:{" "}
                  <span className="font-[var(--font-mono)] text-[var(--text)]">
                    ₹{t.price}
                  </span>
                </div>
              )}
              {t.qty && (
                <div className="text-xs text-[var(--muted)]">
                  Qty:{" "}
                  <span className="font-[var(--font-mono)] text-[var(--text)]">
                    {t.qty}
                  </span>
                </div>
              )}
              {t.amount > 0 && (
                <div className="text-xs text-[var(--muted)]">
                  Amount:{" "}
                  <span className="font-[var(--font-mono)] text-[var(--text)]">
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
