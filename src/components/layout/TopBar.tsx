"use client";
import { useState, useRef } from "react";
import { Icon } from "@/components/ui";
import { PAGE_NAMES } from "@/constants/nav";
import { THRESHOLDS } from "@/constants/thresholds";
import type { PhoenixData } from "@/types";

// ─── TopBar ───────────────────────────────────────────────────────────────────
export default function TopBar({
  data,
  page,
  themeName,
  onThemeChange,
  onNav,
  themes,
}: {
  data: PhoenixData;
  page: string;
  themeName: string;
  onThemeChange: (name: string) => void;
  onNav: (page: string) => void;
  themes: string[];
}) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = data.convictionAlerts.filter((a) => !a.read).length;
  const isDark = themeName !== "Pro Light";

  // Build searchable items: holdings + watchlist
  const q = searchVal.trim().toLowerCase();
  const searchResults =
    q.length < 1
      ? []
      : [
          ...data.assets
            .filter(
              (a) =>
                a.ticker?.toLowerCase().includes(q) ||
                a.name.toLowerCase().includes(q),
            )
            .slice(0, THRESHOLDS.SEARCH.PORTFOLIO_RESULTS)
            .map((a) => ({ label: a.ticker ?? a.name, sub: a.name, dest: "portfolio" as const, tag: "Portfolio" })),
          ...data.watchlist
            .filter(
              (w) =>
                w.ticker.toLowerCase().includes(q) ||
                w.name.toLowerCase().includes(q),
            )
            .slice(0, THRESHOLDS.SEARCH.WATCHLIST_RESULTS)
            .map((w) => ({ label: w.ticker, sub: w.name, dest: "watchlist" as const, tag: "Watchlist" })),
          ...data.reports
            .filter(
              (r) =>
                r.ticker.toLowerCase().includes(q) ||
                r.name.toLowerCase().includes(q),
            )
            .slice(0, THRESHOLDS.SEARCH.REPORTS_RESULTS)
            .map((r) => ({ label: r.ticker, sub: r.name, dest: "reports" as const, tag: "Reports" })),
        ];

  return (
    <header className="h-14 bg-[var(--surface)] border-b border-[var(--border)] flex items-center px-5 gap-4 shrink-0">
      {/* Page title */}
      <span className="font-semibold text-base text-[var(--text)] mr-2">
        {PAGE_NAMES[page as keyof typeof PAGE_NAMES] || page}
      </span>

      {/* Search */}
      <div className="flex-1 max-w-[340px] relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] flex pointer-events-none">
          <Icon name="search" size={15} />
        </span>
        <input
          value={searchVal}
          onChange={(e) => {
            setSearchVal(e.target.value);
            setShowSearch(true);
          }}
          onFocus={() => setShowSearch(true)}
          onBlur={() => setTimeout(() => setShowSearch(false), 150)}
          placeholder="Search ticker, name…"
          className="w-full py-[7px] pr-3 pl-[34px] bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] outline-none font-[inherit]"
        />
        {showSearch && searchResults.length > 0 && (
          <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.3)] z-[9999] overflow-hidden">
            {searchResults.map((r, i) => (
              <button
                type="button"
                key={i}
                onMouseDown={() => {
                  onNav(r.dest);
                  setSearchVal("");
                  setShowSearch(false);
                }}
                className="w-full py-[9px] px-[14px] flex items-center gap-[10px] bg-transparent border-0 cursor-pointer text-left border-b border-[var(--border)]"
              >
                <span className="font-[var(--font-mono)] font-bold text-[var(--accent)] text-sm min-w-[72px]">
                  {r.label}
                </span>
                <span className="text-[11px] text-[var(--muted)] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {r.sub}
                </span>
                <span className="text-[10px] text-[var(--muted)] px-[6px] py-px border border-[var(--border)] rounded whitespace-nowrap">
                  {r.tag}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Theme toggle */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowTheme((v) => !v)}
          className="bg-[var(--bg)] border border-[var(--border)] rounded-lg py-1.5 px-2.5 cursor-pointer text-[var(--text)] flex items-center gap-1.5 text-xs"
        >
          <Icon name={isDark ? "moon" : "sun"} size={15} />
          <span className="font-[var(--font-mono)]">{themeName}</span>
        </button>
        {showTheme && (
          <div className="absolute top-[38px] right-0 bg-[var(--surface)] border border-[var(--border)] rounded-lg min-w-[160px] z-[999] shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
            {themes.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => {
                  onThemeChange(t);
                  setShowTheme(false);
                }}
                className={`w-full py-[10px] px-[14px] text-left border-0 cursor-pointer text-sm rounded ${
                  t === themeName
                    ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                    : "bg-transparent text-[var(--text)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          type="button"
          onClick={() => setShowNotifs((v) => !v)}
          className="bg-transparent border-0 cursor-pointer text-[var(--muted)] p-1.5 flex relative rounded-lg"
        >
          <Icon name="bell" size={18} />
          {unread > 0 && (
            <span className="absolute top-[2px] right-[2px] w-2 h-2 rounded-full bg-[var(--loss)] border-[1.5px] border-[var(--surface)]" />
          )}
        </button>
        {showNotifs && (
          <div className="absolute top-[38px] right-0 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] z-[999] shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
            <div className="py-3 px-4 border-b border-[var(--border)] font-semibold text-sm text-[var(--text)]">
              Alerts ({unread} unread)
            </div>
            {data.convictionAlerts
              .filter((a) => !a.read)
              .map((a) => (
                <div
                  key={a.id}
                  className="py-[10px] px-4 border-b border-[var(--border)]"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        a.severity === "high"
                          ? "bg-[var(--loss)]"
                          : a.severity === "medium"
                            ? "bg-[var(--warn)]"
                            : "bg-[var(--info)]"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-[var(--text)]">
                        {a.ticker} — {a.type}
                      </div>
                      <div className="text-[11px] text-[var(--muted)] mt-0.5">
                        {a.message}
                      </div>
                      <div className="text-[10px] text-[var(--muted)] mt-[3px] font-[var(--font-mono)]">
                        {a.date}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {unread === 0 && (
              <div className="p-5 text-center text-sm text-[var(--muted)]">
                All caught up — no unread alerts
              </div>
            )}
          </div>
        )}
      </div>

      {/* Day change — color kept dynamic (gain/loss depends on runtime value) */}
      <div
        className="font-[var(--font-mono)] text-xs whitespace-nowrap"
        style={{ color: data.dayChange >= 0 ? "var(--gain)" : "var(--loss)" }}
      >
        {data.dayChange >= 0 ? "+" : ""}₹
        {Math.abs(data.dayChange).toLocaleString("en-IN")} (
        {data.dayChange >= 0 ? "+" : ""}
        {data.dayChangePct.toFixed(2)}%)
      </div>
    </header>
  );
}
