"use client";

export function Badge({
  rec,
  size = "sm",
}: {
  rec: string | null;
  size?: "sm" | "xs";
}) {
  if (!rec) return null;
  const cfg: Record<string, { label: string; bg: string; color: string }> = {
    buy: { label: "BUY", bg: "var(--gain-bg)", color: "var(--gain)" },
    hold: { label: "HOLD", bg: "var(--warn-bg)", color: "var(--warn)" },
    watch: { label: "WATCH", bg: "var(--info-bg)", color: "var(--info)" },
    sell: { label: "SELL", bg: "var(--loss-bg)", color: "var(--loss)" },
  };
  const c = cfg[rec] || {
    label: rec.toUpperCase(),
    bg: "var(--surface2)",
    color: "var(--muted)",
  };
  const px = size === "xs" ? "5px 8px" : "3px 10px";
  const fs = size === "xs" ? "10px" : "11px";
  return (
    <span
      className="rounded-full font-bold tracking-[.04em] whitespace-nowrap"
      style={{
        background: c.bg,
        color: c.color,
        padding: px,
        fontSize: fs,
      }}
    >
      {c.label}
    </span>
  );
}
