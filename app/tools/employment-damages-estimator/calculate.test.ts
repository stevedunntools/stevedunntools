import { describe, it, expect } from "vitest";
import { calculateEmploymentDamages } from "./calculate";

const example = {
  monthlyComp: 7000, monthlyBenefits: 1500, monthsSinceTermination: 12,
  jobs: [{ months: 6, monthlyComp: 5000, monthlyBenefits: 0, current: true }],
  frontPayMonths: 6, compensatory: 50000, liquidatedType: "none" as const, punitive: 0, otherDamages: 0,
};

describe("calculateEmploymentDamages", () => {
  it("worked example: $102,000 back pay, $30,000 mitigation, $21,000 front pay, $50,000 distress = $143,000", () => {
    const r = calculateEmploymentDamages(example);
    expect(r.backPay).toBe(102000);
    expect(r.totalMitigation).toBe(30000);
    expect(r.netBackPay).toBe(72000);
    expect(r.frontPay).toBe(21000);
    expect(r.grossTotal).toBe(143000);
  });

  it("a current job with benefits offsets front pay too", () => {
    const r = calculateEmploymentDamages({ ...example, jobs: [{ months: 6, monthlyComp: 7000, monthlyBenefits: 1500, current: true }] });
    expect(r.frontPay).toBe(0);
  });

  it("liquidated multiples apply to net back pay, allocated proportionally", () => {
    const base = { ...example, compensatory: 0 };
    // net/back = 72,000/102,000; net comp = 84,000 × that ≈ 59,294.12
    expect(calculateEmploymentDamages({ ...base, liquidatedType: "2x-wages" }).liquidated).toBeCloseTo(59294.12, 2);
    expect(calculateEmploymentDamages({ ...base, liquidatedType: "2x-wages-benefits" }).liquidated).toBe(72000);
    expect(calculateEmploymentDamages({ ...base, liquidatedType: "3x-wages" }).liquidated).toBeCloseTo(118588.24, 2);
  });

  it("never lets mitigation drive back pay negative", () => {
    expect(calculateEmploymentDamages({ ...example, jobs: [{ months: 12, monthlyComp: 20000, monthlyBenefits: 0, current: false }] }).netBackPay).toBe(0);
  });
});
