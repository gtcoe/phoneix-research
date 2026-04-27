"use client";
import { useState, useRef } from "react";
import { Icon } from "@/components/ui";

export function CSVImport() {
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }
    setImportedCount(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text
        .trim()
        .split("\n")
        .map((r) => r.split(",").map((c) => c.trim()));
      setUploaded(file.name);
      setPreview(rows.slice(0, 6));
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: 16,
        }}
      >
        Import CSV Data
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 12,
          padding: 40,
          textAlign: "center",
          background: dragging ? "var(--accent-dim)" : "var(--surface)",
          cursor: "pointer",
          transition: "all .2s",
        }}
      >
        <Icon
          name="upload"
          size={32}
          color={dragging ? "var(--accent)" : "var(--muted)"}
        />
        <div
          style={{
            marginTop: 12,
            fontSize: 14,
            color: dragging ? "var(--accent)" : "var(--text)",
          }}
        >
          {dragging ? "Drop to upload" : "Drag & drop CSV or click to browse"}
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
          Supports Zerodha, Groww, Kite export formats
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {uploaded && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: "var(--gain)", marginBottom: 10 }}>
            ✓ Loaded: {uploaded}
          </div>
          <div
            style={{
              overflowX: "auto",
              background: "var(--surface)",
              borderRadius: 8,
              border: "1px solid var(--border)",
            }}
          >
            <table
              style={{
                borderCollapse: "collapse",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                width: "100%",
              }}
            >
              {preview.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      style={{
                        padding: "7px 12px",
                        color: i === 0 ? "var(--muted)" : "var(--text)",
                        fontWeight: i === 0 ? 600 : 400,
                        background: i === 0 ? "var(--surface2)" : "transparent",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </table>
          </div>
          <button
            onClick={() => {
              const rowCount = Math.max(0, preview.length - 1); // minus header
              setImportedCount(rowCount);
              setUploaded(null);
              setPreview([]);
            }}
            style={{
              marginTop: 12,
              padding: "8px 20px",
              background: "var(--accent)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Import {preview.length - 1} Rows
          </button>
          {importedCount !== null && (
            <div
              style={{
                marginTop: 10,
                padding: "10px 14px",
                background: "var(--surface)",
                border: "1px solid var(--gain)",
                borderRadius: 8,
                color: "var(--gain)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ✓ {importedCount} transactions imported (prototype — backend will persist)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
