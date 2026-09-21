import { describe, it, expect } from "vitest";
import { calculateEmploymentContingency } from "./calculate";

describe("calculateEmploymentContingency", () => {
  it("worked example: $250,000 at 40% less $10,000, split 50/50", () => {
    const r = calculateEmploymentContingency({ settlement: 250000, feePct: 40, costs: 10000, wagesPct: 50 });
    expect(r.attorneyFee).toBe(100000);
    expect(r.netToPlaintiff).toBe(140000);
    expect(r.wages).toBe(70000);
    expect(r.nonWage).toBe(70000);
  });

  it("wage and non-wage always add back to the net", () => {
    const r = calculateEmploymentContingency({ settlement: 100001, feePct: 33.333, costs: 1234.56, wagesPct: 33.333 });
    expect(r.wages + r.nonWage).toBeCloseTo(r.netToPlaintiff, 10);
  });
});
