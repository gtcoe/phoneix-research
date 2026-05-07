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
    <div className="flex gap-[10px] mb-4 items-center flex-wrap">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search…"
        className="py-1.5 px-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] text-xs outline-none w-[180px]"
      />
      <select
        value={filterType}
        onChange={(e) => onTypeChange(e.target.value)}
        className="py-1.5 px-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] text-xs"
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
        className="py-1.5 px-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] text-xs"
      >
        {allCategories.map((c) => (
          <option key={c} value={c}>
            {c === "all" ? "All Categories" : c}
          </option>
        ))}
      </select>
      <span className="text-xs text-[var(--muted)] font-[var(--font-mono)] ml-1">
        {filteredCount} entries
      </span>
      <button
        type="button"
        onClick={onAddClick}
        className="ml-auto flex items-center gap-1.5 py-[7px] px-3.5 bg-[var(--accent)] border-0 rounded-lg cursor-pointer text-white text-xs font-semibold"
      >
        <Icon name="plus" size={14} color="#fff" />
        Log Transaction
      </button>
    </div>
  );
}
