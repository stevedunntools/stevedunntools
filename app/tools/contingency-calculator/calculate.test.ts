import { describe, it, expect } from "vitest";
import { calculateContingency } from "./calculate";

// Fixtures are the worked examples from lib/tool-content.ts.
describe("calculateContingency", () => {
  it("worked example: $250,000 at 33.333% less $10,000 costs", () => {
    const r = calculateContingency({ settlement: 250000, feePct: 33.333, costs: 10000 });
    expect(r.attorneyFee).toBe(83332.5);
    expect(r.netToPlaintiff).toBe(156667.5);
  });

  it("worked example: only $150,000 of the settlement is covered", () => {
    const r = calculateContingency({ settlement: 250000, feePct: 33.333, costs: 10000, notCovered: 100000 });
    expect(r.covered).toBe(150000);
    expect(r.attorneyFee).toBe(49999.5);
    expect(r.netToPlaintiff).toBe(190000.5);
  });

  it("never charges a fee on more than the settlement", () => {
    expect(calculateContingency({ settlement: 50000, feePct: 40, costs: 0, notCovered: 80000 }).attorneyFee).toBe(0);
  });
});
