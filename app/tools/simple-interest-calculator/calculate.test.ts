import { describe, it, expect } from "vitest";
import { calculateSimpleInterest } from "./calculate";

describe("calculateSimpleInterest", () => {
  it("worked example: $100,000 at 8% for 18 months", () => {
    const r = calculateSimpleInterest(100000, 8, 18, "months");
    expect(r.interest).toBeCloseTo(12000, 6);
    expect(r.total).toBeCloseTo(112000, 6);
  });

  it("worked example: 245 days at 8% on $100,000", () => {
    expect(calculateSimpleInterest(100000, 8, 245, "days").interest).toBeCloseTo(5369.86, 2);
  });
});
