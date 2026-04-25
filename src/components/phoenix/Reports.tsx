"use client";
import { useState } from "react";
import { Badge, ConvictionDot, Icon } from "./ui";
import type { PhoenixData } from "@/lib/data";

export default function Reports({ data }: { data: PhoenixData }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    data.reports[0]?.slug || null,
  );

  const selected = data.reports.find((r) => r.slug === selectedSlug);

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 56px)",
        overflow: "hidden",
      }}
    >
      {/* Sidebar list */}
      <div
        style={{
          width: 280,
          flexShrink: 0,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
          }}
        >
          Reports ({data.reports.length})
        </div>
        {data.reports.map((r) => (
          <button
            key={r.slug}
            onClick={() => setSelectedSlug(r.slug)}
            style={{
              width: "100%",
              padding: "12px 16px",
              textAlign: "left",
              background:
                selectedSlug === r.slug ? "var(--accent-dim)" : "transparent",
              border: "none",
              borderBottom: "1px solid var(--border)",
              cursor: "pointer",
              borderLeft:
                selectedSlug === r.slug
                  ? "3px solid var(--accent)"
                  : "3px solid transparent",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color:
                      selectedSlug === r.slug ? "var(--accent)" : "var(--text)",
                    fontFamily: "var(--font-mono)",
                    marginBottom: 2,
                  }}
                >
                  {r.ticker}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text)",
                    fontWeight: 500,
                    lineHeight: 1.3,
                  }}
                >
                  {r.name}
                </div>
                <div
                  style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}
                >
                  {r.date} · {r.sector}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 4,
                }}
              >
                <Badge rec={r.rec} size="xs" />
                <ConvictionDot score={r.conviction} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Report viewer */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {selected ? (
          <>
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--surface)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--accent)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {selected.ticker}
                </span>
                <span style={{ fontSize: 13, color: "var(--text)" }}>
                  {selected.name}
                </span>
                <Badge rec={selected.rec} />
                <ConvictionDot score={selected.conviction} />
              </div>
              <a
                href={`/analyses/${selected.file?.replace(/^analyses\//, "")}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "var(--accent)",
                  textDecoration: "none",
                }}
              >
                <Icon name="external" size={14} />
                Open in new tab
              </a>
            </div>
            <iframe
              src={`/analyses/${selected.file?.replace(/^analyses\//, "")}`}
              style={{ flex: 1, border: "none", background: "#fff" }}
              title={`${selected.ticker} Analysis`}
            />
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 10,
              color: "var(--muted)",
            }}
          >
            <Icon name="reports" size={40} />
            <span style={{ fontSize: 15 }}>Select a report to view</span>
          </div>
        )}
      </div>
    </div>
  );
}
