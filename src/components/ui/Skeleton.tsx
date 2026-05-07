"use client";

export function Skeleton({
  width = "100%",
  height = 16,
  radius = 6,
}: {
  width?: string | number;
  height?: number;
  radius?: number;
}) {
  return (
    <div
      className="bg-[var(--surface2)] animate-pulse"
      style={{ width, height, borderRadius: radius }}
    />
  );
}
