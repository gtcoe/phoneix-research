"use client";
import React from "react";

export function StatCard({
  label,
  value,
  sub,
  subColor,
  mono = true,
  accent = false,
  children,
}: {
  label: string;
  value: string | number;
  sub?: string | null;
  subColor?: string;
  mono?: boolean;
  accent?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: accent ? "var(--accent)" : "var(--card)",
        border: accent ? "none" : "1px solid var(--border)",
        borderRadius: 10,
        padding: "14px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: accent ? "rgba(255,255,255,0.7)" : "var(--muted)",
          letterSpacing: ".04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: accent ? "#fff" : "var(--text)",
          fontFamily: mono ? "var(--font-mono)" : "inherit",
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
      {sub && (
        <span
          style={{
            fontSize: 12,
            color:
              subColor || (accent ? "rgba(255,255,255,0.75)" : "var(--muted)"),
          }}
        >
          {sub}
        </span>
      )}
      {children}
    </div>
  );
}
