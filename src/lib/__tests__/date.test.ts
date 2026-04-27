import { describe, it, expect } from "vitest";
import { pd, pdFull, MO } from "../date";

describe("MO — month name to index map", () => {
  it("maps Jan→0 and Dec→11", () => {
    expect(MO["Jan"]).toBe(0);
    expect(MO["Dec"]).toBe(11);
  });

  it("covers all 12 months", () => {
    expect(Object.keys(MO)).toHaveLength(12);
  });
});

describe("pd — 'Mon YYYY' date parser", () => {
  it("returns null for null input", () => {
    expect(pd(null)).toBeNull();
  });

  it("parses 'Jan 2024' → 15th Jan 2024", () => {
    const d = pd("Jan 2024");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2024);
    expect(d!.getMonth()).toBe(0);   // January
    expect(d!.getDate()).toBe(15);
  });

  it("parses 'Dec 2025' correctly", () => {
    const d = pd("Dec 2025");
    expect(d!.getFullYear()).toBe(2025);
    expect(d!.getMonth()).toBe(11);  // December
  });
});

describe("pdFull — 'Mon DD YYYY' date parser", () => {
  it("parses 'Apr 15 2026'", () => {
    const d = pdFull("Apr 15 2026");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(3);    // April
    expect(d.getDate()).toBe(15);
  });

  it("parses 'Jan 01 2024'", () => {
    const d = pdFull("Jan 01 2024");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getDate()).toBe(1);
  });
});
