import { fmt } from "@/lib/formatters";
import { Gain, ConvictionDot } from "@/components/ui";
import type { PhoenixData } from "@/types";

type Asset = PhoenixData["assets"][number];

interface Props {
  assets: Asset[];
}

export default function TopHoldings({ assets }: Props) {
  const top5 = [...assets].sort((a, b) => b.current - a.current).slice(0, 5);

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-4 px-5">
      <div className="text-sm font-semibold text-[var(--text)] mb-3.5">
        Top Holdings
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {["Company", "Value", "Gain/%", "Conv"].map((h) => (
              <th
                key={h}
                className={`pb-2 text-[11px] text-[var(--muted)] font-medium tracking-[.04em] ${h === "Company" ? "text-left" : "text-right"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {top5.map((a) => (
            <tr key={a.id} className="border-b border-[var(--border)]">
              <td className="py-2.5 flex items-center gap-2">
                <div>
                  <div className="font-semibold text-[var(--text)]">
                    {a.ticker}
                  </div>
                  <div className="text-[11px] text-[var(--muted)]">
                    {a.name.slice(0, 22)}
                  </div>
                </div>
              </td>
              <td className="text-right font-[var(--font-mono)] text-[var(--text)]">
                {fmt(a.current)}
              </td>
              <td className="text-right">
                <Gain value={a.gain} pct={a.gainPct} />
              </td>
              <td className="text-right">
                <ConvictionDot score={a.conviction} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
