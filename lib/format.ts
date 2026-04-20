/** Format a number as a dollar amount with commas, e.g. "$1,234,567" */
export function fmt(n: number) {
  if (!isFinite(n)) return "$0";
  if (n < 0) return "-$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/**
 * Format a raw numeric string with commas for readability.
 * Strips existing formatting first, returns empty string for empty input.
 * Preserves decimals if present.
 */
export function commaFmt(s: string): string {
  const cleaned = s.replace(/[$,\s]/g, "");
  if (cleaned === "" || cleaned === "-") return cleaned;
  const n = parseFloat(cleaned);
  if (isNaN(n)) return s;
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
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
