import { describe, it, expect } from "vitest";
import { calculateExpectedValue } from "./calculate";

describe("calculateExpectedValue", () => {
  it("worked example: $250,000 at 60%, two years at 4%, less $15,000", () => {
    const r = calculateExpectedValue({ damages: 250000, probabilityPct: 60, yearsToPayment: 2, discountRatePct: 4, fees: 0, litigationCosts: 10000, intangibleCosts: 5000 });
    expect(r.probabilityAdjusted).toBe(150000);
    expect(r.discountedValue).toBeCloseTo(138683.43, 2);
    expect(r.expectedValue).toBeCloseTo(123683.43, 2);
  });

  it("does not discount when payment is immediate", () => {
    expect(calculateExpectedValue({ damages: 100, probabilityPct: 100, yearsToPayment: 0, discountRatePct: 50, fees: 0, litigationCosts: 0, intangibleCosts: 0 }).expectedValue).toBe(100);
  });
});
