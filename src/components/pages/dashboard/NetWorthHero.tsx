import { fmt } from "@/lib/formatters";
import { Gain, StatCard, AreaChart } from "@/components/ui";
import type { PhoenixData } from "@/lib/data";

export default function NetWorthHero({ data }: { data: PhoenixData }) {
  return (
    <>
      {/* Net worth hero */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "22px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: ".05em",
                marginBottom: 4,
              }}
            >
              Portfolio Value
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: "var(--text)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {fmt(data.netWorth)}
            </div>
            <div style={{ marginTop: 6, fontSize: 14 }}>
              <Gain value={data.totalGains} pct={data.totalGainsPct} />
              <span
                style={{ fontSize: 12, color: "var(--muted)", marginLeft: 12 }}
              >
                invested {fmt(data.totalInvested)}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatCard
              label="XIRR"
              value={`${data.xirr.toFixed(1)}%`}
              sub={`α +${data.alpha.toFixed(1)}% vs Nifty50`}
              subColor="var(--gain)"
            />
            <StatCard
              label="CAGR"
              value={`${data.cagr.toFixed(1)}%`}
              sub="Since inception"
            />
            <StatCard
              label="Day P/L"
              value={`${data.dayChange >= 0 ? "+" : ""}₹${Math.abs(data.dayChange).toLocaleString("en-IN")}`}
              sub={`${data.dayChange >= 0 ? "+" : ""}${data.dayChangePct.toFixed(2)}%`}
              subColor={data.dayChange >= 0 ? "var(--gain)" : "var(--loss)"}
            />
          </div>
        </div>
      </div>

      {/* Area chart */}
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
            marginBottom: 14,
          }}
        >
          Portfolio Growth
        </div>
        <AreaChart
          data={data.history}
          width={860}
          height={200}
          color="var(--accent)"
          labelKey="date"
          valueKey="value"
        />
      </div>
    </>
  );
}
