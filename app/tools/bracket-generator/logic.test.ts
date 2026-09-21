import { describe, it, expect } from "vitest";
import { solveBracket } from "./logic";

describe("solveBracket", () => {
  it("worked example: our number 500,000 and midpoint 350,000 fills in 200,000", () => {
    const r = solveBracket("mid", { upper: 500000, lower: null, mid: 350000 });
    expect(r).toEqual({ values: { upper: 500000, lower: 200000, mid: 350000 }, autoField: "lower" });
  });

  it("two endpoints give the midpoint", () => {
    expect(solveBracket("lower", { upper: 500000, lower: 200000, mid: null })?.values.mid).toBe(350000);
  });

  it("moving the midpoint slides both ends and keeps the spread", () => {
    const r = solveBracket("mid", { upper: 500000, lower: 200000, mid: 400000 })!;
    expect(r.values).toEqual({ upper: 550000, lower: 250000, mid: 400000 });
    expect(r.autoField).toBeNull();
  });

  it("does nothing with only one value", () => {
    expect(solveBracket("upper", { upper: 1, lower: null, mid: null })).toBeNull();
  });
});
