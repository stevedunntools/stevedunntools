import { describe, it, expect } from "vitest";
import { pointsToPath, generateYTicks, formatTickLabel } from "./chart-utils";

describe("pointsToPath", () => {
  it("returns an empty string for no points", () => {
    expect(pointsToPath([])).toBe("");
  });

  it("builds an open path", () => {
    expect(pointsToPath([{ x: 0, y: 0 }, { x: 10, y: 20 }])).toBe("M0.0,0.0 L10.0,20.0");
  });

  it("closes the path when requested", () => {
    expect(pointsToPath([{ x: 0, y: 0 }, { x: 10, y: 20 }], true)).toBe(
      "M0.0,0.0 L10.0,20.0 Z"
    );
  });
});

describe("generateYTicks", () => {
  it("returns ticks within the range", () => {
    const ticks = generateYTicks(0, 1000000);
    expect(ticks.length).toBeGreaterThan(1);
    for (const t of ticks) {
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(1000000);
    }
  });

  it("handles a degenerate range", () => {
    expect(generateYTicks(100, 100)).toEqual([100]);
  });

  it("handles negative ranges", () => {
    const ticks = generateYTicks(-500000, 500000);
    expect(ticks.some((t) => t < 0)).toBe(true);
    expect(ticks.some((t) => t >= 0)).toBe(true);
  });
});

describe("formatTickLabel", () => {
  it("formats thousands and millions", () => {
    expect(formatTickLabel(500000)).toBe("$500k");
    expect(formatTickLabel(1500000)).toBe("$1.5M");
    expect(formatTickLabel(2000000)).toBe("$2M");
    expect(formatTickLabel(500)).toBe("$500");
  });

  it("formats negative values", () => {
    expect(formatTickLabel(-500000)).toBe("-$500k");
  });
});
