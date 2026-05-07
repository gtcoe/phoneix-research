import { fmt } from "@/lib/formatters";
import { Gain, StatCard, AreaChart } from "@/components/ui";
import type { PhoenixData } from "@/types";

export default function NetWorthHero({ data }: { data: PhoenixData }) {
  return (
    <>
      {/* Net worth hero */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-[22px] px-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-[.05em] mb-1">
              Portfolio Value
            </div>
            <div className="text-4xl font-extrabold text-[var(--text)] font-[var(--font-mono)]">
              {fmt(data.netWorth)}
            </div>
            <div className="mt-1.5 text-sm">
              <Gain value={data.totalGains} pct={data.totalGainsPct} />
              <span className="text-xs text-[var(--muted)] ml-3">
                invested {fmt(data.totalInvested)}
              </span>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
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
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-[18px] px-5">
        <div className="text-sm font-semibold text-[var(--text)] mb-3.5">
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
