import { describe, it, expect } from "vitest";
import { fmt, fmtPct, fmtNum } from "../formatters";

describe("fmt — INR currency formatter", () => {
  it("returns em-dash for null", () => expect(fmt(null)).toBe("—"));
  it("returns em-dash for undefined", () => expect(fmt(undefined)).toBe("—"));

  it("formats crores (≥1Cr)", () => {
    expect(fmt(10_000_000)).toBe("₹1.00Cr");
    expect(fmt(25_500_000)).toBe("₹2.55Cr");
    expect(fmt(100_000_000)).toBe("₹10.00Cr");
  });

  it("formats lakhs (≥1L, <1Cr)", () => {
    expect(fmt(100_000)).toBe("₹1.00L");
    expect(fmt(550_000)).toBe("₹5.50L");
    expect(fmt(9_999_999)).toBe("₹100.00L");
  });

  it("formats thousands (≥1K, <1L)", () => {
    expect(fmt(1_000)).toBe("₹1.0K");
    expect(fmt(99_999)).toBe("₹100.0K");
  });

  it("formats small values directly", () => {
    expect(fmt(500)).toBe("₹500");
    expect(fmt(0)).toBe("₹0");
  });
});

describe("fmtPct — percentage formatter", () => {
  it("returns em-dash for null/undefined", () => {
    expect(fmtPct(null)).toBe("—");
    expect(fmtPct(undefined)).toBe("—");
  });

  it("prefixes + for positive values", () => {
    expect(fmtPct(12.5)).toBe("+12.5%");
    expect(fmtPct(0)).toBe("+0.0%");
  });

  it("no prefix for negative values", () => {
    expect(fmtPct(-8.3)).toBe("-8.3%");
  });

  it("respects custom decimal places", () => {
    expect(fmtPct(12.5678, 2)).toBe("+12.57%");
    expect(fmtPct(12.5678, 0)).toBe("+13%");
  });
});

describe("fmtNum — numeric formatter", () => {
  it("formats with locale separators", () => {
    // en-IN uses commas: 1,00,000
    expect(fmtNum(100_000)).toMatch(/1,00,000/);
    expect(fmtNum(0)).toBe("0");
  });
});
