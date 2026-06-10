import { describe, it, expect } from "vitest";
import {
  getFederalHolidays,
  isFederalHoliday,
  isWeekend,
  isBusinessDay,
  countBusinessDays,
  addBusinessDays,
  daysInMonth,
} from "./date-utils";

function d(year: number, month: number, day: number) {
  return new Date(year, month, day);
}

describe("getFederalHolidays", () => {
  it("returns 11 federal holidays", () => {
    expect(getFederalHolidays(2026)).toHaveLength(11);
  });

  it("computes floating holidays for 2026", () => {
    const holidays = getFederalHolidays(2026);
    const has = (m: number, day: number) =>
      holidays.some((h) => h.getMonth() === m && h.getDate() === day);
    expect(has(0, 19)).toBe(true); // MLK Day — 3rd Monday of January 2026
    expect(has(4, 25)).toBe(true); // Memorial Day — last Monday of May 2026
    expect(has(10, 26)).toBe(true); // Thanksgiving — 4th Thursday of November 2026
  });

  it("observes a Saturday holiday on the preceding Friday", () => {
    // July 4, 2026 is a Saturday → observed Friday July 3
    const holidays = getFederalHolidays(2026);
    expect(holidays.some((h) => h.getMonth() === 6 && h.getDate() === 3)).toBe(true);
  });

  it("observes a Sunday holiday on the following Monday", () => {
    // July 4, 2027 is a Sunday → observed Monday July 5
    const holidays = getFederalHolidays(2027);
    expect(holidays.some((h) => h.getMonth() === 6 && h.getDate() === 5)).toBe(true);
  });
});

describe("isFederalHoliday", () => {
  it("recognizes a fixed holiday", () => {
    expect(isFederalHoliday(d(2026, 11, 25))).toBe(true); // Christmas 2026
  });

  it("recognizes next year's New Year's observed on Dec 31", () => {
    // Jan 1, 2028 is a Saturday → observed Friday Dec 31, 2027
    expect(isFederalHoliday(d(2027, 11, 31))).toBe(true);
  });

  it("does not flag an ordinary weekday", () => {
    expect(isFederalHoliday(d(2026, 2, 10))).toBe(false); // Tue Mar 10, 2026
  });
});

describe("isWeekend / isBusinessDay", () => {
  it("identifies weekends", () => {
    expect(isWeekend(d(2026, 5, 6))).toBe(true); // Sat June 6, 2026
    expect(isWeekend(d(2026, 5, 8))).toBe(false); // Mon June 8, 2026
  });

  it("treats holidays as non-business days when excluded", () => {
    const christmas = d(2026, 11, 25); // Friday
    expect(isBusinessDay(christmas, true)).toBe(false);
    expect(isBusinessDay(christmas, false)).toBe(true);
  });
});

describe("countBusinessDays", () => {
  it("counts weekdays across a full week", () => {
    // Mon June 8 → Mon June 15, 2026: Tue-Fri + Mon = 5
    expect(countBusinessDays(d(2026, 5, 8), d(2026, 5, 15), false)).toBe(5);
  });

  it("skips holidays when excluded", () => {
    // Thu July 2 → Mon July 6, 2026. July 3 is observed July 4th, 4-5 weekend.
    expect(countBusinessDays(d(2026, 6, 2), d(2026, 6, 6), true)).toBe(1);
    expect(countBusinessDays(d(2026, 6, 2), d(2026, 6, 6), false)).toBe(2);
  });
});

describe("addBusinessDays", () => {
  it("skips weekends", () => {
    // Fri June 5, 2026 + 1 business day = Mon June 8
    const result = addBusinessDays(d(2026, 5, 5), 1, false);
    expect(result.getDate()).toBe(8);
  });

  it("skips observed holidays", () => {
    // Thu July 2, 2026 + 1 business day: skips Fri July 3 (observed), Sat, Sun → Mon July 6
    const result = addBusinessDays(d(2026, 6, 2), 1, true);
    expect(result.getDate()).toBe(6);
  });

  it("subtracts business days with negative input", () => {
    // Mon June 8, 2026 - 1 business day = Fri June 5
    const result = addBusinessDays(d(2026, 5, 8), -1, false);
    expect(result.getDate()).toBe(5);
  });
});

describe("daysInMonth", () => {
  it("handles leap years", () => {
    expect(daysInMonth(2028, 1)).toBe(29);
    expect(daysInMonth(2026, 1)).toBe(28);
  });
});
