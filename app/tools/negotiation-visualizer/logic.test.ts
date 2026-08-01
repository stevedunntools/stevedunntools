import { describe, it, expect } from "vitest";
import {
  Offer,
  Party,
  parseInput,
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

  it("parses decimal amounts and brackets", () => {
    expect(parseInput("1234.56")).toEqual({ type: "number", value: 1234.56, low: 0, high: 0 });
    expect(parseInput("$1,234.56")?.value).toBe(1234.56);
    expect(parseInput("100.5-200.5")).toEqual({
      type: "bracket", value: 0, low: 100.5, high: 200.5,
    });
  });

  it("rejects a half-typed bracket instead of truncating it to a firm offer", () => {
    // "200,000-" used to parse as a $200,000 number offer via parseFloat
    expect(parseInput("200,000-")).toBeNull();
    expect(parseInput("200,000 - ")).toBeNull();
  });

  it("rejects trailing garbage and interior spaces instead of truncating", () => {
    expect(parseInput("500 000")).toBeNull();
    expect(parseInput("100,000abc")).toBeNull();
    expect(parseInput("100,000-abc")).toBeNull();
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

  it("re-opens an earlier round left one-sided by a deletion", () => {
    // P1, D1, P2, D2 with P1 deleted → the next offer fills round 1
    const offers = [
      offer("defendant", 1, 50000),
      offer("plaintiff", 2, 450000),
      offer("defendant", 2, 75000),
    ];
    expect(nextRoundFor(offers)).toBe(1);
  });

  it("advances past a refilled hole", () => {
    const offers = [
      offer("defendant", 1, 50000),
      offer("plaintiff", 1, 480000),
      offer("plaintiff", 2, 450000),
      offer("defendant", 2, 75000),
    ];
    expect(nextRoundFor(offers)).toBe(3);
  });
});
