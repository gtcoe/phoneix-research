"use client";
import { useState } from "react";
import { Icon } from "@/components/ui";
import { NAV_ITEMS } from "@/constants/nav";

// ─── PhoenixLogo ──────────────────────────────────────────────────────────────
export function PhoenixLogo({ small = false }: { small?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: small ? 0 : 10,
        justifyContent: small ? "center" : "flex-start",
      }}
    >
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
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: ".01em",
            fontFamily: "var(--font-mono)",
          }}
        >
          Phoenix<span style={{ color: "var(--accent)" }}>.</span>
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
      style={{
        width: W,
        minWidth: W,
        maxWidth: W,
        height: "100vh",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        transition: "width .2s ease",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Logo area */}
      <div
        style={{
          padding: collapsed ? "18px 0" : "18px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid var(--border)",
          minHeight: 60,
        }}
      >
        {!collapsed && <PhoenixLogo />}
        <button
          onClick={onToggle}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted)",
            padding: 4,
            display: "flex",
            alignItems: "center",
            borderRadius: 6,
          }}
        >
          <Icon name="menu" size={18} />
        </button>
      </div>

      {/* Nav items */}
      <nav
        style={{
          flex: 1,
          padding: "10px 0",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                width: "100%",
                padding: collapsed ? "10px 0" : "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: isActive ? "var(--accent-dim)" : "transparent",
                border: "none",
                cursor: "pointer",
                color: isActive ? "var(--accent)" : "var(--muted)",
                fontWeight: isActive ? 600 : 400,
                fontSize: 13,
                transition: "all .15s",
                borderLeft: isActive
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
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
                <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
