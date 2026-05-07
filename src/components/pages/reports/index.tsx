"use client";
import { useState, useMemo } from "react";
import { Badge, ConvictionDot, Icon } from "@/components/ui";
import type { Report, ReportType } from "@/types/report";
import type { PhoenixData } from "@/types";

const GROUPS: Array<{ type: ReportType; label: string }> = [
  { type: "stock",            label: "Stock Analyses"       },
  { type: "comparison",       label: "Comparisons"          },
  { type: "investor",         label: "Investor Portfolios"  },
  { type: "portfolio-review", label: "Portfolio Reviews"    },
];

export default function Reports({ data }: { data: PhoenixData }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    data.reports[0]?.slug || null,
  );
  const [iframeError, setIframeError] = useState(false);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<ReportType>>(new Set());

  const handleSlugChange = (slug: string) => {
    setSelectedSlug(slug);
    setIframeError(false);
  };

  const toggleSection = (type: ReportType) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const selected = data.reports.find((r) => r.slug === selectedSlug);
  const q = search.trim().toLowerCase();

  const grouped = useMemo(() =>
    GROUPS.map(({ type, label }) => {
      const all = data.reports
        .filter((r) => (r.type ?? "stock") === type)
        .sort((a, b) => a.name.localeCompare(b.name));

      const filtered = q
        ? all.filter(
            (r) =>
              r.name.toLowerCase().includes(q) ||
              r.ticker?.toLowerCase().includes(q) ||
              r.sector?.toLowerCase().includes(q),
          )
        : all;

      return { type, label, reports: filtered, total: all.length };
    }).filter((g) => g.total > 0),
  [data.reports, q]);

  const visibleCount = grouped.reduce((s, g) => s + g.reports.length, 0);

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* ── Sidebar ── */}
      <div className="w-[280px] shrink-0 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col overflow-hidden">

        {/* Header row: title + search */}
        <div className="shrink-0 px-3 py-2.5 border-b border-[var(--border)] flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--text)] shrink-0">
            Reports ({data.reports.length})
          </span>
          <div className="flex-1 flex items-center gap-1.5 bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[var(--muted)]">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[11px] text-[var(--text)] placeholder:text-[var(--muted)] min-w-0"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-[var(--muted)] hover:text-[var(--text)] leading-none bg-transparent border-none cursor-pointer p-0"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Search result count */}
        {q && (
          <div className="px-4 py-1.5 text-[11px] text-[var(--muted)] border-b border-[var(--border)] shrink-0">
            {visibleCount} result{visibleCount !== 1 ? "s" : ""}
          </div>
        )}

        {/* Sections */}
        <div className="flex-1 overflow-y-auto">
          {grouped.map(({ type, label, reports, total }) => {
            const isCollapsed = collapsed.has(type);
            const showing = q ? reports.length : total;
            return (
              <div key={type}>
                {/* Section header with collapse toggle */}
                <button
                  type="button"
                  onClick={() => toggleSection(type)}
                  className="w-full flex items-center justify-between px-4 pt-2.5 pb-1.5 bg-[var(--bg)] border-b border-[var(--border)] cursor-pointer sticky top-0 z-10"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                    {label}
                    <span className="ml-1.5 font-normal normal-case tracking-normal">
                      ({showing})
                    </span>
                  </span>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    className={`text-[var(--muted)] transition-transform duration-150 ${isCollapsed ? "-rotate-90" : ""}`}
                  >
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </button>

                {!isCollapsed && reports.map((r) => (
                  <ReportSidebarItem
                    key={r.slug}
                    report={r}
                    active={selectedSlug === r.slug}
                    onClick={() => handleSlugChange(r.slug)}
                  />
                ))}

                {!isCollapsed && q && reports.length === 0 && (
                  <div className="px-4 py-3 text-[11px] text-[var(--muted)] italic border-b border-[var(--border)]">
                    No matches
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Report viewer ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <>
            <ReportViewerHeader report={selected} />
            <iframe
              src={`/analyses/${selected.file?.replace(/^analyses\//, "")}`}
              className={`flex-1 border-none bg-[var(--bg)] ${iframeError ? "hidden" : "block"}`}
              title={selected.ticker ? `${selected.ticker} Analysis` : selected.name}
              onError={() => setIframeError(true)}
            />
            {iframeError && (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--muted)] gap-3">
                <Icon name="alert" size={32} color="var(--border)" />
                <div className="text-sm">Report not found</div>
                <div className="text-xs text-[var(--muted)]">
                  {selected.file || "No file linked"}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-[10px] text-[var(--muted)]">
            <Icon name="reports" size={40} />
            <span className="text-base">Select a report to view</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ReportSidebarItem({
  report: r,
  active,
  onClick,
}: {
  report: Report;
  active: boolean;
  onClick: () => void;
}) {
  const isStock = (r.type ?? "stock") === "stock";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full py-3 px-4 text-left border-none border-b border-[var(--border)] cursor-pointer border-l-[3px] ${
        active
          ? "bg-[var(--accent-dim)] border-l-[var(--accent)]"
          : "bg-transparent border-l-transparent"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div
            className={`text-xs font-bold font-[var(--font-mono)] mb-0.5 truncate ${
              active ? "text-[var(--accent)]" : "text-[var(--text)]"
            }`}
          >
            {r.ticker ?? <span className="font-normal italic">{r.sector}</span>}
          </div>
          <div className="text-xs text-[var(--text)] font-medium leading-[1.3] line-clamp-2">
            {r.name}
          </div>
          <div className="text-[11px] text-[var(--muted)] mt-[3px]">
            {r.date}
          </div>
        </div>
        {isStock && (
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge rec={r.rec} size="xs" />
            <ConvictionDot score={r.conviction} />
          </div>
        )}
      </div>
    </button>
  );
}

function ReportViewerHeader({ report: r }: { report: Report }) {
  const typeLabel: Record<string, string> = {
    comparison:          "Comparison",
    investor:            "Investor Portfolio",
    "portfolio-review":  "Portfolio Review",
  };
  const label = r.type ? typeLabel[r.type] : null;

  return (
    <div className="py-3 px-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)] shrink-0">
      <div className="flex items-center gap-[10px] min-w-0">
        {r.ticker ? (
          <span className="text-sm font-bold text-[var(--accent)] font-[var(--font-mono)] shrink-0">
            {r.ticker}
          </span>
        ) : label ? (
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] bg-[var(--surface2)] px-2 py-0.5 rounded shrink-0">
            {label}
          </span>
        ) : null}
        <span className="text-sm text-[var(--text)] truncate">{r.name}</span>
        {r.rec && <Badge rec={r.rec} />}
        {r.conviction != null && <ConvictionDot score={r.conviction} />}
      </div>
      <a
        href={`/analyses/${r.file?.replace(/^analyses\//, "")}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 text-xs text-[var(--accent)] no-underline shrink-0 ml-4"
      >
        <Icon name="external" size={14} />
        Open in new tab
      </a>
    </div>
  );
}
