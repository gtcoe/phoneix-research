"use client";

export function ConvictionDot({ score }: { score: number | null }) {
  if (!score) return null;
  const color =
    score >= 8 ? "var(--gain)" : score >= 6 ? "var(--warn)" : "var(--muted)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "var(--surface2)",
        color,
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "var(--font-mono)",
      }}
    >
      {score}
    </span>
  );
}
