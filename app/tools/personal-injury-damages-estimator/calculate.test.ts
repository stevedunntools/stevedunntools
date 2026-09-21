import { describe, it, expect } from "vitest";
import { calculatePersonalInjury } from "./calculate";

const example = { medicalToDate: 25000, futureMedical: 10000, lostEarningsToDate: 15000, futureLostEarnings: 20000, propertyDamage: 5000, multiplier: 3, pastOnlyBase: false, faultPct: 0 };

describe("calculatePersonalInjury", () => {
  it("worked example: $35,000 medicals at 3× plus $40,000 economic = $180,000; range $145,000–$215,000", () => {
    const r = calculatePersonalInjury(example);
    expect(r.painAndSuffering).toBe(105000);
    expect(r.total).toBe(180000);
    expect(r.rangeLow).toBe(145000);
    expect(r.rangeHigh).toBe(215000);
  });

  it("applies the multiple to past medicals only when asked", () => {
    expect(calculatePersonalInjury({ ...example, pastOnlyBase: true }).painAndSuffering).toBe(75000);
  });

  it("reduces the total by the plaintiff's share of fault, rounded to cents", () => {
    const r = calculatePersonalInjury({ ...example, faultPct: 20 });
    expect(r.faultReduction).toBe(36000);
    expect(r.total).toBe(144000);
  });

  it("clamps the range to the 1×–5× slider", () => {
    expect(calculatePersonalInjury({ ...example, multiplier: 5 }).rangeHighMult).toBe(5);
    expect(calculatePersonalInjury({ ...example, multiplier: 1 }).rangeLowMult).toBe(1);
  });
});
