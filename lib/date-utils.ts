/**
 * U.S. Federal Holiday calculations and business day utilities.
 */

/**
 * Adjust a fixed-date holiday for weekend substitution:
 * Saturday → observed on preceding Friday, Sunday → observed on following Monday.
 */
function observedDate(d: Date): Date {
  const day = d.getDay();
  if (day === 6) return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
  if (day === 0) return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return d;
}

/** Get all U.S. federal holidays for a given year */
export function getFederalHolidays(year: number): Date[] {
  const holidays: Date[] = [];

  // New Year's Day — January 1
  holidays.push(observedDate(new Date(year, 0, 1)));

  // MLK Day — Third Monday of January
  holidays.push(nthWeekday(year, 0, 1, 3));

  // Presidents' Day — Third Monday of February
  holidays.push(nthWeekday(year, 1, 1, 3));

  // Memorial Day — Last Monday of May
  holidays.push(lastWeekday(year, 4, 1));

  // Juneteenth — June 19
  holidays.push(observedDate(new Date(year, 5, 19)));

  // Independence Day — July 4
  holidays.push(observedDate(new Date(year, 6, 4)));

  // Labor Day — First Monday of September
  holidays.push(nthWeekday(year, 8, 1, 1));

  // Columbus Day — Second Monday of October
  holidays.push(nthWeekday(year, 9, 1, 2));

  // Veterans Day — November 11
  holidays.push(observedDate(new Date(year, 10, 11)));

  // Thanksgiving — Fourth Thursday of November
  holidays.push(nthWeekday(year, 10, 4, 4));

  // Christmas — December 25
  holidays.push(observedDate(new Date(year, 11, 25)));

  return holidays;
}

/** Get the nth occurrence of a weekday in a month (1-indexed) */
function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1);
  let dayOfWeek = first.getDay();
  let diff = weekday - dayOfWeek;
  if (diff < 0) diff += 7;
  const day = 1 + diff + (n - 1) * 7;
  return new Date(year, month, day);
}

/** Get the last occurrence of a weekday in a month */
function lastWeekday(year: number, month: number, weekday: number): Date {
  const last = new Date(year, month + 1, 0); // last day of month
  let dayOfWeek = last.getDay();
  let diff = dayOfWeek - weekday;
  if (diff < 0) diff += 7;
  return new Date(year, month, last.getDate() - diff);
}

/** Check if a date is a federal holiday */
export function isFederalHoliday(date: Date): boolean {
  const holidays = getFederalHolidays(date.getFullYear());
  const dNorm = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return holidays.some((h) => {
    const hNorm = new Date(h.getFullYear(), h.getMonth(), h.getDate()).getTime();
    return hNorm === dNorm;
  });
}

/** Check if a date is a weekend */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Check if a date is a business day */
export function isBusinessDay(date: Date, excludeHolidays: boolean = true): boolean {
  if (isWeekend(date)) return false;
  if (excludeHolidays && isFederalHoliday(date)) return false;
  return true;
}

/**
 * Count business days between two dates (exclusive of start, inclusive of end).
 */
export function countBusinessDays(
  start: Date,
  end: Date,
  excludeHolidays: boolean = true
): number {
  let count = 0;
  const direction = end >= start ? 1 : -1;
  const current = new Date(start);
  current.setDate(current.getDate() + direction);

  while (
    direction > 0 ? current <= end : current >= end
  ) {
    if (isBusinessDay(current, excludeHolidays)) count++;
    current.setDate(current.getDate() + direction);
  }

  return count;
}

/**
 * Add business days to a date. Positive to add, negative to subtract.
 */
export function addBusinessDays(
  start: Date,
  days: number,
  excludeHolidays: boolean = true
): Date {
  const direction = days >= 0 ? 1 : -1;
  let remaining = Math.abs(days);
  const current = new Date(start);

  while (remaining > 0) {
    current.setDate(current.getDate() + direction);
    if (isBusinessDay(current, excludeHolidays)) {
      remaining--;
    }
  }

  return current;
}

/** Month names for dropdowns */
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Get days in a month */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
