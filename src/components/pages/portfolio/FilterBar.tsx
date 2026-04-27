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
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 16,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {CATEGORIES.map((c) => (
        <button
          key={c}
          onClick={() => onCategoryChange(c)}
          style={{
            padding: "5px 14px",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            background: category === c ? "var(--accent)" : "var(--surface)",
            border: "1px solid var(--border)",
            color: category === c ? "#fff" : "var(--muted)",
            transition: "all .15s",
          }}
        >
          {c}
        </button>
      ))}
      <span
        style={{
          marginLeft: "auto",
          fontSize: 12,
          color: "var(--muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {holdingsCount} holdings
      </span>
      <button
        onClick={onAddClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 14px",
          background: "var(--accent)",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <Icon name="plus" size={14} color="#fff" />
        Log Transaction
      </button>
    </div>
  );
}
