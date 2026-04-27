"use client";
import { Icon } from "@/components/ui";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  filterType: string;
  onTypeChange: (v: string) => void;
  filterCategory: string;
  onCategoryChange: (v: string) => void;
  allTypes: string[];
  allCategories: string[];
  filteredCount: number;
  onAddClick: () => void;
}

export default function FilterBar({
  search,
  onSearchChange,
  filterType,
  onTypeChange,
  filterCategory,
  onCategoryChange,
  allTypes,
  allCategories,
  filteredCount,
  onAddClick,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 16,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search…"
        style={{
          padding: "6px 12px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: 12,
          outline: "none",
          width: 180,
        }}
      />
      <select
        value={filterType}
        onChange={(e) => onTypeChange(e.target.value)}
        style={{
          padding: "6px 12px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: 12,
        }}
      >
        {allTypes.map((t) => (
          <option key={t} value={t}>
            {t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
      <select
        value={filterCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        style={{
          padding: "6px 12px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: 12,
        }}
      >
        {allCategories.map((c) => (
          <option key={c} value={c}>
            {c === "all" ? "All Categories" : c}
          </option>
        ))}
      </select>
      <span
        style={{
          fontSize: 12,
          color: "var(--muted)",
          fontFamily: "var(--font-mono)",
          marginLeft: 4,
        }}
      >
        {filteredCount} entries
      </span>
      <button
        onClick={onAddClick}
        style={{
          marginLeft: "auto",
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
