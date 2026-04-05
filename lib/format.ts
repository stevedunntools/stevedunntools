/** Format a number as a dollar amount with commas, e.g. "$1,234,567" */
export function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/**
 * Parse a dollar/number string, returning 0 for empty or invalid input.
 * Strips $, commas, and whitespace before parsing.
 */
export function parseNum(s: string): number {
  const cleaned = s.replace(/[$,\s]/g, "");
  if (cleaned === "") return 0;
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

/**
 * Parse a dollar/number string, returning null for empty or invalid input.
 * Use this when you need to distinguish "no input" from "zero".
 */
export function parseNumOrNull(s: string): number | null {
  const cleaned = s.replace(/[$,\s]/g, "");
  if (cleaned === "") return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}
