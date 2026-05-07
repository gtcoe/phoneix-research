import { useMemo } from "react";
import { fmt } from "@/lib/formatters";
import { Gain } from "@/components/ui";
import type { PhoenixData } from "@/types";

type Asset = PhoenixData["assets"][number];

export function SectorTab({ data }: { data: PhoenixData }) {
  const sectors = useMemo(() => {
    const sectorMap: Record<
      string,
      { current: number; invested: number; assets: Asset[] }
    > = {};
    data.assets.forEach((a) => {
      if (!sectorMap[a.sector])
        sectorMap[a.sector] = { current: 0, invested: 0, assets: [] };
      sectorMap[a.sector].current += a.current;
      sectorMap[a.sector].invested += a.invested;
      sectorMap[a.sector].assets.push(a);
    });
    return Object.entries(sectorMap).sort(([, a], [, b]) => b.current - a.current);
  }, [data.assets]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {sectors.map(([sector, info]) => {
        const gain = info.current - info.invested;
        const gainPct =
          info.invested > 0 ? (gain / info.invested) * 100 : 0;
        const weight = (info.current / data.netWorth) * 100;
        return (
          <div
            key={sector}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text)",
                  }}
                >
                  {sector}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginLeft: 8,
                  }}
                >
                  {weight.toFixed(1)}% of portfolio
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  alignItems: "flex-start",
                }}
              >
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--muted)",
                      letterSpacing: ".04em",
                      marginBottom: 2,
                    }}
                  >
                    CURRENT VALUE
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {fmt(info.current)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--muted)",
                      letterSpacing: ".04em",
                      marginBottom: 2,
                    }}
                  >
                    GAIN
                  </div>
                  <Gain value={gain} pct={gainPct} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {info.assets.map((a) => (
                <div
                  key={a.id}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--accent)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {a.ticker}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text)",
                      marginTop: 2,
                    }}
                  >
                    {fmt(a.current)}
                  </div>
                  <Gain value={a.gain} pct={a.gainPct} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
