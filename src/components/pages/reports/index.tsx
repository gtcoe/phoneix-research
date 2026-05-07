"use client";
import { useState } from "react";
import { Badge, ConvictionDot, Icon } from "@/components/ui";
import type { PhoenixData } from "@/types";

export default function Reports({ data }: { data: PhoenixData }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    data.reports[0]?.slug || null,
  );
  const [iframeError, setIframeError] = useState(false);

  const handleSlugChange = (slug: string) => {
    setSelectedSlug(slug);
    setIframeError(false);
  };

  const selected = data.reports.find((r) => r.slug === selectedSlug);

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Sidebar list */}
      <div className="w-[280px] shrink-0 bg-[var(--surface)] border-r border-[var(--border)] overflow-y-auto">
        <div className="py-3.5 px-4 border-b border-[var(--border)] text-sm font-semibold text-[var(--text)]">
          Reports ({data.reports.length})
        </div>
        {data.reports.map((r) => (
          <button
            type="button"
            key={r.slug}
            onClick={() => handleSlugChange(r.slug)}
            className={`w-full py-3 px-4 text-left border-none border-b border-[var(--border)] cursor-pointer border-l-[3px] ${
              selectedSlug === r.slug
                ? "bg-[var(--accent-dim)] border-l-[var(--accent)]"
                : "bg-transparent border-l-transparent"
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <div
                  className={`text-xs font-bold font-[var(--font-mono)] mb-0.5 ${
                    selectedSlug === r.slug ? "text-[var(--accent)]" : "text-[var(--text)]"
                  }`}
                >
                  {r.ticker}
                </div>
                <div className="text-xs text-[var(--text)] font-medium leading-[1.3]">
                  {r.name}
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-[3px]">
                  {r.date} · {r.sector}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge rec={r.rec} size="xs" />
                <ConvictionDot score={r.conviction} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Report viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <>
            <div className="py-3 px-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)] shrink-0">
              <div className="flex items-center gap-[10px]">
                <span className="text-sm font-bold text-[var(--accent)] font-[var(--font-mono)]">
                  {selected.ticker}
                </span>
                <span className="text-sm text-[var(--text)]">
                  {selected.name}
                </span>
                <Badge rec={selected.rec} />
                <ConvictionDot score={selected.conviction} />
              </div>
              <a
                href={`/analyses/${selected.file?.replace(/^analyses\//, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-[var(--accent)] no-underline"
              >
                <Icon name="external" size={14} />
                Open in new tab
              </a>
            </div>
            <iframe
              src={`/analyses/${selected.file?.replace(/^analyses\//, "")}`}
              className={`flex-1 border-none bg-[var(--bg)] ${iframeError ? "hidden" : "block"}`}
              title={`${selected.ticker} Analysis`}
              onError={() => setIframeError(true)}
            />
            {iframeError && (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--muted)] gap-3">
                <Icon name="alert" size={32} color="var(--border)" />
                <div className="text-sm">Report not found</div>
                <div className="text-xs text-[var(--muted)]">
                  {selected.file || "No file linked"}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-[10px] text-[var(--muted)]">
            <Icon name="reports" size={40} />
            <span className="text-base">Select a report to view</span>
          </div>
        )}
      </div>
    </div>
  );
}
