import type { ConvictionAlert } from "@/types/alert";

interface Props {
  alerts: ConvictionAlert[];
}

export default function ConvictionAlertsCard({ alerts }: Props) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-4 px-5">
      <div className="text-sm font-semibold text-[var(--text)] mb-3.5">
        Conviction Alerts
      </div>
      <div className="flex flex-col gap-[10px]">
        {alerts.slice(0, 6).map((a) => (
          <div
            key={a.id}
            className={`flex gap-[10px] ${a.read ? "opacity-55" : "opacity-100"}`}
          >
            <span
              className="w-2 h-2 rounded-full mt-1 shrink-0"
              style={{
                background:
                  a.severity === "high"
                    ? "var(--loss)"
                    : a.severity === "medium"
                      ? "var(--warn)"
                      : "var(--info)",
              }}
            />
            <div>
              <div className="text-xs font-semibold text-[var(--text)]">
                {a.ticker} — {a.type}
              </div>
              <div className="text-[11px] text-[var(--muted)] leading-[1.4]">
                {a.message}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
