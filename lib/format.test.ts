import { describe, it, expect } from "vitest";
import {
  fmt,
  commaFmt,
  commaFmtNum,
  commaFmtWithCursor,
  parseNum,
  parseNumOrNull,
} from "./format";

describe("fmt", () => {
  it("formats whole dollar amounts with commas", () => {
    expect(fmt(1234567)).toBe("$1,234,567");
    expect(fmt(0)).toBe("$0");
    expect(fmt(999)).toBe("$999");
  });

  it("formats negative amounts with a leading minus", () => {
    expect(fmt(-50000)).toBe("-$50,000");
  });

  it("shows cents for fractional amounts, rounded to the nearest cent", () => {
    expect(fmt(1234.56)).toBe("$1,234.56");
    expect(fmt(1234.4)).toBe("$1,234.40");
    expect(fmt(1234.567)).toBe("$1,234.57");
    expect(fmt(-1234.5)).toBe("-$1,234.50");
  });

  it("omits cents for whole-dollar amounts", () => {
    expect(fmt(250000)).toBe("$250,000");
    expect(fmt(1234.001)).toBe("$1,234");
  });

  it("does not render -$0 for sub-cent negative values", () => {
    expect(fmt(-0.001)).toBe("$0");
    expect(fmt(-0)).toBe("$0");
  });

  it("returns $0 for non-finite input", () => {
    expect(fmt(NaN)).toBe("$0");
    expect(fmt(Infinity)).toBe("$0");
  });
});

describe("commaFmt", () => {
  it("adds thousands separators", () => {
    expect(commaFmt("1234567")).toBe("1,234,567");
    expect(commaFmt("1000")).toBe("1,000");
  });

  it("strips existing $/comma/space formatting first", () => {
    expect(commaFmt("$1,234,567")).toBe("1,234,567");
    expect(commaFmt("1 000 000")).toBe("1,000,000");
  });

  it("returns empty/lone-minus input unchanged", () => {
    expect(commaFmt("")).toBe("");
    expect(commaFmt("-")).toBe("-");
  });

  it("preserves a trailing decimal point mid-typing", () => {
    expect(commaFmt("1234.")).toBe("1,234.");
  });

  it("preserves partial and full decimal parts", () => {
    expect(commaFmt("1234.5")).toBe("1,234.5");
    expect(commaFmt("1234.50")).toBe("1,234.50");
    expect(commaFmt("1,234.56")).toBe("1,234.56");
  });

  it("caps decimals at two digits", () => {
    expect(commaFmt("1234.567")).toBe("1,234.56");
  });

  it("handles negative numbers", () => {
    expect(commaFmt("-50000")).toBe("-50,000");
  });

  it("returns unparseable input unchanged", () => {
    expect(commaFmt("abc")).toBe("abc");
  });
});

describe("commaFmtNum", () => {
  it("keeps cents when present", () => {
    expect(commaFmtNum(10661.856)).toBe("10,661.86");
    expect(commaFmtNum(250000.5)).toBe("250,000.50");
  });

  it("drops cents for whole amounts", () => {
    expect(commaFmtNum(10000)).toBe("10,000");
  });
});

describe("commaFmtWithCursor", () => {
  it("keeps the cursor after the last typed digit when a comma is inserted", () => {
    // Typing the 4th digit of "1234" — formatted to "1,234", cursor at end
    const r = commaFmtWithCursor("1234", 4);
    expect(r.value).toBe("1,234");
    expect(r.cursor).toBe(5);
  });

  it("maps an interior cursor across inserted commas", () => {
    // Cursor after "12" in "1234" → after "2" in "1,234" (index 3)
    const r = commaFmtWithCursor("1234", 2);
    expect(r.value).toBe("1,234");
    expect(r.cursor).toBe(3);
  });

  it("keeps the cursor after a freshly typed decimal point", () => {
    const r = commaFmtWithCursor("1234.", 5);
    expect(r.value).toBe("1,234.");
    expect(r.cursor).toBe(6);
  });

  it("puts the cursor at 0 when nothing significant precedes it", () => {
    const r = commaFmtWithCursor("1234", 0);
    expect(r.cursor).toBe(0);
  });

  it("falls back to the end when formatting drops characters", () => {
    // Third decimal digit is trimmed; cursor can't map past it
    const r = commaFmtWithCursor("1.234", 5);
    expect(r.value).toBe("1.23");
    expect(r.cursor).toBe(4);
  });
});

describe("parseNum", () => {
  it("parses formatted dollar strings", () => {
    expect(parseNum("$1,234,567")).toBe(1234567);
    expect(parseNum("1,234.56")).toBe(1234.56);
  });

  it("returns 0 for empty or invalid input", () => {
    expect(parseNum("")).toBe(0);
    expect(parseNum("abc")).toBe(0);
  });
});

describe("parseNumOrNull", () => {
  it("distinguishes empty from zero", () => {
    expect(parseNumOrNull("")).toBeNull();
    expect(parseNumOrNull("0")).toBe(0);
  });

  it("returns null for invalid input", () => {
    expect(parseNumOrNull("abc")).toBeNull();
  });
});
