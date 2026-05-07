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
      className={`rounded-[10px] py-[14px] px-[18px] flex flex-col gap-1 ${accent ? "bg-[var(--accent)] border-0" : "bg-[var(--card)] border border-[var(--border)]"}`}
    >
      <span
        className="text-[11px] tracking-[.04em] uppercase"
        style={{ color: accent ? "rgba(255,255,255,0.7)" : "var(--muted)" }}
      >
        {label}
      </span>
      <span
        className={`text-[22px] font-bold leading-[1.1] ${accent ? "text-white" : "text-[var(--text)]"} ${mono ? "font-[var(--font-mono)]" : ""}`}
      >
        {value}
      </span>
      {sub && (
        <span
          className="text-xs"
          style={{ color: subColor || (accent ? "rgba(255,255,255,0.75)" : "var(--muted)") }}
        >
          {sub}
        </span>
      )}
      {children}
    </div>
  );
}
