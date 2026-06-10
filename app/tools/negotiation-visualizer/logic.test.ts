import { describe, it, expect } from "vitest";
import {
  Offer,
  Party,
  parseInput,
  computeConvergence,
  offerValues,
  nextRoundFor,
} from "./logic";

let nextId = 0;
function offer(
  party: Party,
  round: number,
  value: number | [number, number],
): Offer {
  const id = `t${nextId++}`;
  if (Array.isArray(value)) {
    return { id, party, round, type: "bracket", value: 0, low: value[0], high: value[1] };
  }
  return { id, party, round, type: "number", value, low: 0, high: 0 };
}

describe("parseInput", () => {
  it("parses plain and formatted numbers", () => {
    expect(parseInput("500000")).toEqual({ type: "number", value: 500000, low: 0, high: 0 });
    expect(parseInput("500,000")).toEqual({ type: "number", value: 500000, low: 0, high: 0 });
    expect(parseInput("$500,000")).toEqual({ type: "number", value: 500000, low: 0, high: 0 });
  });

  it("parses zero and negative numbers", () => {
    expect(parseInput("0")?.value).toBe(0);
    expect(parseInput("-100,000")?.value).toBe(-100000);
  });

  it("parses brackets and normalizes low/high order", () => {
    expect(parseInput("200,000-400,000")).toEqual({
      type: "bracket", value: 0, low: 200000, high: 400000,
    });
    expect(parseInput("400,000-200,000")).toEqual({
      type: "bracket", value: 0, low: 200000, high: 400000,
    });
  });

  it("parses brackets with a negative endpoint", () => {
    expect(parseInput("-100,000-50,000")).toEqual({
      type: "bracket", value: 0, low: -100000, high: 50000,
    });
  });

  it("parses en-dash and em-dash separators", () => {
    expect(parseInput("200,000–400,000")?.type).toBe("bracket");
    expect(parseInput("200,000—400,000")?.type).toBe("bracket");
  });

  it("rejects a zero-width bracket", () => {
    expect(parseInput("100,000-100,000")).toBeNull();
  });

  it("rejects empty and non-numeric input", () => {
    expect(parseInput("")).toBeNull();
    expect(parseInput("   ")).toBeNull();
    expect(parseInput("abc")).toBeNull();
  });
});

describe("offerValues", () => {
  it("uses the value for number offers", () => {
    expect(offerValues(offer("plaintiff", 1, 500000))).toEqual({
      low: 500000, high: 500000, mid: 500000,
    });
  });

  it("uses low/high/midpoint for brackets", () => {
    expect(offerValues(offer("plaintiff", 1, [200000, 400000]))).toEqual({
      low: 200000, high: 400000, mid: 300000,
    });
  });
});

describe("computeConvergence", () => {
  it("returns null with fewer than two offers per party", () => {
    expect(computeConvergence([])).toBeNull();
    expect(
      computeConvergence([
        offer("plaintiff", 1, 500000),
        offer("defendant", 1, 50000),
        offer("plaintiff", 2, 400000),
      ])
    ).toBeNull();
  });

  it("projects the intersection of converging trends", () => {
    const result = computeConvergence([
      offer("plaintiff", 1, 500000),
      offer("defendant", 1, 50000),
      offer("plaintiff", 2, 400000),
      offer("defendant", 2, 150000),
    ]);
    // Slopes: P −100k/round, D +100k/round. They meet at round 3.25, $275,000.
    expect(result).not.toBeNull();
    expect(result!.round).toBeCloseTo(3.25, 5);
    expect(result!.value).toBeCloseTo(275000, 5);
  });

  it("returns null for diverging trends", () => {
    expect(
      computeConvergence([
        offer("plaintiff", 1, 400000),
        offer("defendant", 1, 150000),
        offer("plaintiff", 2, 500000),
        offer("defendant", 2, 50000),
      ])
    ).toBeNull();
  });

  it("returns null for parallel trends", () => {
    expect(
      computeConvergence([
        offer("plaintiff", 1, 500000),
        offer("defendant", 1, 100000),
        offer("plaintiff", 2, 400000),
        offer("defendant", 2, 0),
      ])
    ).toBeNull();
  });

  it("uses bracket midpoints in the projection", () => {
    const result = computeConvergence([
      offer("plaintiff", 1, [400000, 600000]), // mid 500k
      offer("defendant", 1, 50000),
      offer("plaintiff", 2, [300000, 500000]), // mid 400k
      offer("defendant", 2, 150000),
    ]);
    expect(result).not.toBeNull();
    expect(result!.round).toBeCloseTo(3.25, 5);
    expect(result!.value).toBeCloseTo(275000, 5);
  });
});

describe("nextRoundFor", () => {
  it("starts at round 1", () => {
    expect(nextRoundFor([])).toBe(1);
  });

  it("stays in the current round until both parties have offered", () => {
    expect(nextRoundFor([offer("plaintiff", 1, 500000)])).toBe(1);
  });

  it("advances once both parties have offered", () => {
    expect(
      nextRoundFor([offer("plaintiff", 1, 500000), offer("defendant", 1, 50000)])
    ).toBe(2);
  });
});
