"use client";
import { Icon } from "@/components/ui";

const CATEGORIES = ["All", "NSE Stocks", "US Stocks", "NPS", "FD", "Cash"];

interface Props {
  category: string;
  onCategoryChange: (c: string) => void;
  holdingsCount: number;
  onAddClick: () => void;
}

export default function FilterBar({
  category,
  onCategoryChange,
  holdingsCount,
  onAddClick,
}: Props) {
  return (
    <div className="flex gap-2 mb-4 flex-wrap items-center">
      {CATEGORIES.map((c) => (
        <button
          type="button"
          key={c}
          onClick={() => onCategoryChange(c)}
          className={`py-[5px] px-3.5 rounded-full text-xs font-medium cursor-pointer border border-[var(--border)] transition-all duration-150 ${category === c ? "bg-[var(--accent)] text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}
        >
          {c}
        </button>
      ))}
      <span className="ml-auto text-xs text-[var(--muted)] font-[var(--font-mono)]">
        {holdingsCount} holdings
      </span>
      <button
        type="button"
        onClick={onAddClick}
        className="flex items-center gap-1.5 py-[7px] px-3.5 bg-[var(--accent)] border-0 rounded-lg cursor-pointer text-white text-xs font-semibold"
      >
        <Icon name="plus" size={14} color="#fff" />
        Log Transaction
      </button>
    </div>
  );
}
