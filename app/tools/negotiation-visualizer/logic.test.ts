import { describe, it, expect } from "vitest";
import {
  Offer,
  Party,
  parseInput,
  computeConvergence,
  offerValues,
  nextRoundFor,
  buildExportData,
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
  it("returns null until both sides have made three offers", () => {
    expect(computeConvergence([])).toBeNull();
    expect(
      computeConvergence([
        offer("plaintiff", 1, 500000),
        offer("defendant", 1, 100000),
        offer("plaintiff", 2, 400000),
        offer("defendant", 2, 200000),
      ])
    ).toBeNull();
    expect(
      computeConvergence([
        offer("plaintiff", 1, 500000),
        offer("defendant", 1, 100000),
        offer("plaintiff", 2, 400000),
        offer("defendant", 2, 200000),
        offer("plaintiff", 3, 350000),
      ])
    ).toBeNull();
  });

  it("fits a line through each side's three most recent offers", () => {
    const result = computeConvergence([
      offer("plaintiff", 1, 500000),
      offer("defendant", 1, 100000),
      offer("plaintiff", 2, 400000),
      offer("defendant", 2, 200000),
      offer("plaintiff", 3, 350000),
      offer("defendant", 3, 250000),
    ]);
    // Least-squares through P (1,500k)(2,400k)(3,350k): slope −75k, intercept 566.7k
    // and D (1,100k)(2,200k)(3,250k): slope +75k, intercept 33.3k
    // → intersect at round 3.556, $300,000
    expect(result).not.toBeNull();
    expect(result!.round).toBeCloseTo(3.5556, 3);
    expect(result!.value).toBeCloseTo(300000, 0);
  });

  it("ignores offers older than each side's last three", () => {
    const result = computeConvergence([
      offer("plaintiff", 1, 900000), // outlier opener — must not affect the fit
      offer("defendant", 1, 0),
      offer("plaintiff", 2, 500000),
      offer("defendant", 2, 100000),
      offer("plaintiff", 3, 400000),
      offer("defendant", 3, 200000),
      offer("plaintiff", 4, 350000),
      offer("defendant", 4, 250000),
    ]);
    // Same pattern as above shifted one round later → round 4.556, $300,000
    expect(result).not.toBeNull();
    expect(result!.round).toBeCloseTo(4.5556, 3);
    expect(result!.value).toBeCloseTo(300000, 0);
  });

  it("anchors the drawn extrapolation at each side's last offer", () => {
    const result = computeConvergence([
      offer("plaintiff", 1, 500000),
      offer("defendant", 1, 100000),
      offer("plaintiff", 2, 400000),
      offer("defendant", 2, 200000),
      offer("plaintiff", 3, 350000),
      offer("defendant", 3, 250000),
    ])!;
    expect(result.pStart).toEqual({ round: 3, value: 350000 });
    expect(result.dStart).toEqual({ round: 3, value: 250000 });
  });

  it("returns null for diverging trends", () => {
    expect(
      computeConvergence([
        offer("plaintiff", 1, 350000),
        offer("defendant", 1, 250000),
        offer("plaintiff", 2, 400000),
        offer("defendant", 2, 200000),
        offer("plaintiff", 3, 500000),
        offer("defendant", 3, 100000),
      ])
    ).toBeNull();
  });

  it("returns null for parallel trends", () => {
    expect(
      computeConvergence([
        offer("plaintiff", 1, 500000),
        offer("defendant", 1, 200000),
        offer("plaintiff", 2, 400000),
        offer("defendant", 2, 100000),
        offer("plaintiff", 3, 300000),
        offer("defendant", 3, 0),
      ])
    ).toBeNull();
  });

  it("uses bracket midpoints in the fit", () => {
    const result = computeConvergence([
      offer("plaintiff", 1, [400000, 600000]), // mid 500k
      offer("defendant", 1, 100000),
      offer("plaintiff", 2, [300000, 500000]), // mid 400k
      offer("defendant", 2, 200000),
      offer("plaintiff", 3, [250000, 450000]), // mid 350k
      offer("defendant", 3, 250000),
    ]);
    expect(result).not.toBeNull();
    expect(result!.round).toBeCloseTo(3.5556, 3);
    expect(result!.value).toBeCloseTo(300000, 0);
  });
});

describe("buildExportData", () => {
  it("records a settled case with its settlement amount", () => {
    const data = buildExportData([offer("plaintiff", 1, 500000)], 475000, "2026-07-16T12:00:00Z");
    expect(data.settled).toBe(true);
    expect(data.settlementAmount).toBe(475000);
    expect(data.exportedAt).toBe("2026-07-16T12:00:00Z");
  });

  it("records an unsettled case", () => {
    const data = buildExportData([offer("plaintiff", 1, 500000)], null, "2026-07-16T12:00:00Z");
    expect(data.settled).toBe(false);
    expect(data.settlementAmount).toBeNull();
  });

  it("exports number offers without internal ids", () => {
    const data = buildExportData([offer("plaintiff", 1, 500000)], null, "2026-07-16T12:00:00Z");
    expect(data.offers).toEqual([
      { round: 1, party: "plaintiff", type: "number", amount: 500000 },
    ]);
  });

  it("exports brackets with low, high, and midpoint", () => {
    const data = buildExportData(
      [offer("defendant", 2, [200000, 400000])],
      null,
      "2026-07-16T12:00:00Z",
    );
    expect(data.offers).toEqual([
      { round: 2, party: "defendant", type: "bracket", low: 200000, high: 400000, midpoint: 300000 },
    ]);
  });

  it("sorts offers by round, plaintiff first within a round", () => {
    const data = buildExportData(
      [
        offer("defendant", 2, 200000),
        offer("plaintiff", 1, 500000),
        offer("plaintiff", 2, 400000),
        offer("defendant", 1, 100000),
      ],
      null,
      "2026-07-16T12:00:00Z",
    );
    expect(data.offers.map((o) => [o.round, o.party])).toEqual([
      [1, "plaintiff"],
      [1, "defendant"],
      [2, "plaintiff"],
      [2, "defendant"],
    ]);
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
