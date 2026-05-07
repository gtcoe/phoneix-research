import type { PhoenixData } from "@/types";

export function CorrelationTab({ data }: { data: PhoenixData }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: 16,
        }}
      >
        Correlation Matrix
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 60 }} />
              {data.corrLabels.map((l) => (
                <th
                  key={l}
                  style={{
                    padding: "6px 10px",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontWeight: 500,
                  }}
                >
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.corrMatrix.map((row, i) => (
              <tr key={i}>
                <td
                  style={{
                    padding: "6px 12px 6px 0",
                    color: "var(--muted)",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {data.corrLabels[i]}
                </td>
                {row.map((v, j) => {
                  const bg =
                    v === 1
                      ? "var(--surface)"
                      : v > 0.7
                        ? "rgba(239,68,68,.25)"
                        : v > 0.4
                          ? "rgba(245,158,11,.2)"
                          : v < 0
                            ? "rgba(16,185,129,.2)"
                            : "transparent";
                  return (
                    <td
                      key={j}
                      style={{
                        padding: "6px 10px",
                        textAlign: "center",
                        background: bg,
                        color:
                          v === 1
                            ? "var(--muted)"
                            : v > 0.7
                              ? "var(--loss)"
                              : v < 0
                                ? "var(--gain)"
                                : "var(--text)",
                        borderRadius: 4,
                      }}
                    >
                      {v.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
        {[
          { color: "rgba(239,68,68,.35)", label: "> 0.7 High correlation" },
          { color: "rgba(245,158,11,.3)", label: "0.4–0.7 Medium" },
          {
            color: "rgba(16,185,129,.3)",
            label: "< 0 Negative (diversifying)",
          },
        ].map((l) => (
          <div
            key={l.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                background: l.color,
                borderRadius: 3,
                flexShrink: 0,
              }}
            />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
