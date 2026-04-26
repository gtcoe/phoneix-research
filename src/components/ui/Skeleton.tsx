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
      style={{
        width,
        height,
        borderRadius: radius,
        background: "var(--surface2)",
        animation: "pulse 1.5s ease infinite",
      }}
    />
  );
}
