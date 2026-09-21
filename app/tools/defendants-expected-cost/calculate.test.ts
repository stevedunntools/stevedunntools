import { describe, it, expect } from "vitest";
import { calculateExpectedCost } from "./calculate";

describe("calculateExpectedCost", () => {
  it("worked example: $250,000 at 40%, $75,000 fee shift at 40%, $135,000 sunk", () => {
    const r = calculateExpectedCost({ damages: 250000, damagesProbabilityPct: 40, plaintiffFees: 75000, feeProbabilityPct: 40, defendantFees: 100000, defendantCosts: 25000, intangibleCosts: 10000 });
    expect(r.expectedDamages).toBe(100000);
    expect(r.expectedFeeExposure).toBe(30000);
    expect(r.totalExpectedCost).toBe(265000);
  });
});
