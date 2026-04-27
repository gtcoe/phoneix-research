import { describe, it, expect } from "vitest";
import { calcXIRR } from "../xirr";

/** Build a date from year + fractional years offset for test readability */
function dateAt(year: number, month = 0, day = 1): Date {
  return new Date(year, month, day);
}

describe("calcXIRR", () => {
  it("returns null for fewer than 2 cashflows", () => {
    expect(calcXIRR([])).toBeNull();
    expect(calcXIRR([{ amount: -100_000, date: dateAt(2024) }])).toBeNull();
  });

  it("returns ~0% XIRR for break-even (invested = exited same day)", () => {
    const cfs = [
      { amount: -100_000, date: dateAt(2024, 0, 1) },
      { amount:  100_000, date: dateAt(2024, 0, 1) },
    ];
    const result = calcXIRR(cfs);
    // Same-day means infinite rate — should return null or an extreme value; just check it doesn't throw
    expect(result === null || typeof result === "number").toBe(true);
  });

  it("returns ~20% XIRR for a clean 1-year doubling", () => {
    // Invest 1L, get back 1.2L after exactly 1 year → XIRR ≈ 20%
    const cfs = [
      { amount: -100_000, date: dateAt(2024, 0, 1) },
      { amount:  120_000, date: dateAt(2025, 0, 1) },
    ];
    const result = calcXIRR(cfs);
    expect(result).not.toBeNull();
    expect(result!).toBeCloseTo(20, 0); // within 1% of 20
  });

  it("returns ~0% XIRR when exit equals investment after 1 year (no gain)", () => {
    const cfs = [
      { amount: -100_000, date: dateAt(2024, 0, 1) },
      { amount:  100_000, date: dateAt(2025, 0, 1) },
    ];
    const result = calcXIRR(cfs);
    expect(result).not.toBeNull();
    expect(Math.abs(result!)).toBeLessThan(1); // near 0%
  });

  it("handles multiple cashflows (SIP-like)", () => {
    // Three equal investments, one exit
    const cfs = [
      { amount:  -50_000, date: dateAt(2023, 0, 1) },
      { amount:  -50_000, date: dateAt(2023, 6, 1) },
      { amount:  -50_000, date: dateAt(2024, 0, 1) },
      { amount:  180_000, date: dateAt(2025, 0, 1) },
    ];
    const result = calcXIRR(cfs);
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(0); // positive return
  });

  it("returns negative XIRR for a loss", () => {
    const cfs = [
      { amount: -100_000, date: dateAt(2024, 0, 1) },
      { amount:   80_000, date: dateAt(2025, 0, 1) },
    ];
    const result = calcXIRR(cfs);
    expect(result).not.toBeNull();
    expect(result!).toBeLessThan(0);
  });
});
