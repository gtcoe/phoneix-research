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
      <div className="text-sm font-semibold text-[var(--text)] mb-4">
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
        className={`rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${dragging ? "bg-[var(--accent-dim)]" : "bg-[var(--surface)]"}`}
        style={{ border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}` }}
      >
        <Icon
          name="upload"
          size={32}
          color={dragging ? "var(--accent)" : "var(--muted)"}
        />
        <div
          className={`mt-3 text-sm ${dragging ? "text-[var(--accent)]" : "text-[var(--text)]"}`}
        >
          {dragging ? "Drop to upload" : "Drag & drop CSV or click to browse"}
        </div>
        <div className="text-xs text-[var(--muted)] mt-1">
          Supports Zerodha, Groww, Kite export formats
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {uploaded && (
        <div className="mt-4">
          <div className="text-xs text-[var(--gain)] mb-[10px]">
            ✓ Loaded: {uploaded}
          </div>
          <div className="overflow-x-auto bg-[var(--surface)] rounded-lg border border-[var(--border)]">
            <table className="border-collapse text-xs font-[var(--font-mono)] w-full">
              {preview.map((row, i) => (
                <tr key={i} className="border-b border-[var(--border)]">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`py-[7px] px-3 whitespace-nowrap ${i === 0 ? "text-[var(--muted)] font-semibold bg-[var(--surface2)]" : "text-[var(--text)] font-normal bg-transparent"}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </table>
          </div>
          <button
              type="button"
            onClick={() => {
              const rowCount = Math.max(0, preview.length - 1); // minus header
              setImportedCount(rowCount);
              setUploaded(null);
              setPreview([]);
            }}
            className="mt-3 py-2 px-5 bg-[var(--accent)] border-0 rounded-lg text-white cursor-pointer text-sm font-semibold"
          >
            Import {preview.length - 1} Rows
          </button>
          {importedCount !== null && (
            <div className="mt-[10px] py-[10px] px-3.5 bg-[var(--surface)] border border-[var(--gain)] rounded-lg text-[var(--gain)] text-sm font-semibold">
              ✓ {importedCount} transactions imported (prototype — backend will persist)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
