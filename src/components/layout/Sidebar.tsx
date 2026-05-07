"use client";
import { useState } from "react";
import { Icon } from "@/components/ui";
import { NAV_ITEMS } from "@/constants/nav";

// ─── PhoenixLogo ──────────────────────────────────────────────────────────────
export function PhoenixLogo({ small = false }: { small?: boolean }) {
  return (
    <div className={`flex items-center ${small ? "gap-0 justify-center" : "gap-[10px] justify-start"}`}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M14 2 L26 22 L14 18 L2 22 Z"
          fill="var(--accent)"
          opacity="0.9"
        />
        <path
          d="M14 7 L22 20 L14 16.5 L6 20 Z"
          fill="var(--accent)"
          opacity="0.5"
        />
        <circle cx="14" cy="14" r="3" fill="var(--accent)" />
      </svg>
      {!small && (
        <span className="text-base font-bold text-[var(--text)] tracking-[.01em] font-[var(--font-mono)]">
          Phoenix<span className="text-[var(--accent)]">.</span>
        </span>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export function Sidebar({
  page,
  onNav,
  collapsed,
  onToggle,
}: {
  page: string;
  onNav: (page: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const W = collapsed ? 60 : 220;
  return (
    <aside
      style={{ width: W, minWidth: W, maxWidth: W }}
      className="h-screen bg-[var(--surface)] border-r border-[var(--border)] flex flex-col [transition:width_.2s_ease] overflow-hidden shrink-0"
    >
      {/* Logo area */}
      <div
        className={`py-[18px] flex items-center border-b border-[var(--border)] min-h-[60px] ${
          collapsed ? "px-0 justify-center" : "px-4 justify-between"
        }`}
      >
        {!collapsed && <PhoenixLogo />}
        <button
          type="button"
          onClick={onToggle}
          className="bg-transparent border-0 cursor-pointer text-[var(--muted)] p-1 flex items-center rounded-md"
        >
          <Icon name="menu" size={18} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-[10px] overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = page === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onNav(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 border-0 cursor-pointer text-sm transition-all duration-150 border-l-2 ${
                collapsed ? "py-[10px] px-0 justify-center" : "py-[10px] px-4 justify-start"
              } ${
                isActive
                  ? "bg-[var(--accent-dim)] text-[var(--accent)] font-semibold border-l-[var(--accent)]"
                  : "bg-transparent text-[var(--muted)] font-normal border-l-transparent"
              }`}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--text)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--muted)";
              }}
            >
              <Icon
                name={item.icon}
                size={18}
                color={isActive ? "var(--accent)" : "currentColor"}
              />
              {!collapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
