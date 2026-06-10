/**
 * Format a number as a dollar amount with commas, rounded to the nearest
 * cent. Whole-dollar amounts show no decimals ("$1,234,567"); fractional
 * amounts show cents ("$1,234.56").
 */
export function fmt(n: number) {
  if (!isFinite(n)) return "$0";
  const abs = Math.round(Math.abs(n) * 100) / 100;
  const formatted =
    "$" +
    abs.toLocaleString("en-US", {
      minimumFractionDigits: Number.isInteger(abs) ? 0 : 2,
      maximumFractionDigits: 2,
    });
  return n < 0 && abs > 0 ? "-" + formatted : formatted;
}

/**
 * Format a number for display inside a text input: commas, cents kept when
 * present ("10,661.86"), dropped when the amount is whole ("10,000").
 */
export function commaFmtNum(n: number): string {
  const fixed = n.toFixed(2);
  return commaFmt(fixed.endsWith(".00") ? fixed.slice(0, -3) : fixed);
}

/**
 * Format a raw numeric string with commas for readability.
 * Strips existing formatting first, returns empty string for empty input.
 * Preserves a partial decimal part (including a trailing ".") so the user
 * can type cents without the separator being swallowed mid-keystroke.
 */
export function commaFmt(s: string): string {
  const cleaned = s.replace(/[$,\s]/g, "");
  if (cleaned === "" || cleaned === "-") return cleaned;
  const dot = cleaned.indexOf(".");
  const intRaw = dot === -1 ? cleaned : cleaned.slice(0, dot);
  // Keep at most 2 decimal digits, dropping stray dots and non-digits
  const decRaw = dot === -1 ? null : cleaned.slice(dot + 1).replace(/[^0-9]/g, "").slice(0, 2);
  const n = parseFloat(intRaw === "" || intRaw === "-" ? intRaw + "0" : intRaw);
  if (isNaN(n)) return s;
  const intFmt = n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return decRaw === null ? intFmt : `${intFmt}.${decRaw}`;
}

/**
 * Comma-format `raw` while mapping the text cursor to the equivalent position
 * in the formatted string. Significant characters (digits, ".", "-") are
 * counted; commas added or removed by formatting are skipped over. If
 * formatting drops characters before the cursor, it falls back to the end.
 */
export function commaFmtWithCursor(
  raw: string,
  cursor: number,
): { value: string; cursor: number } {
  const significantBefore = raw.slice(0, cursor).replace(/[^0-9.\-]/g, "").length;
  const value = commaFmt(raw);

  let newCursor = value.length;
  let significant = 0;
  for (let i = 0; i < value.length; i++) {
    if (/[0-9.\-]/.test(value[i])) significant++;
    if (significant === significantBefore) {
      newCursor = i + 1;
      break;
    }
  }
  if (significantBefore === 0) newCursor = 0;

  return { value, cursor: newCursor };
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
