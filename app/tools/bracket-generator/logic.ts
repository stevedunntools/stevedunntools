export type Field = "upper" | "lower" | "mid";

export interface BracketValues {
  upper: number | null;
  lower: number | null;
  mid: number | null;
}

/**
 * Given which field the user just edited, fill in what follows: two endpoints
 * fix the midpoint; an endpoint and the midpoint fix the other endpoint; a new
 * midpoint with both endpoints known slides both by the same amount.
 * Returns the updated values and which field was auto-filled (null when both
 * endpoints moved together).
 */
export function solveBracket(field: Field, v: BracketValues): { values: BracketValues; autoField: Field | null } | null {
  const { upper: u, lower: l, mid: m } = v;
  if (field === "upper" || field === "lower") {
    if (u !== null && l !== null) return { values: { upper: u, lower: l, mid: (u + l) / 2 }, autoField: "mid" };
    if (field === "upper" && u !== null && m !== null) return { values: { upper: u, lower: 2 * m - u, mid: m }, autoField: "lower" };
    if (field === "lower" && l !== null && m !== null) return { values: { upper: 2 * m - l, lower: l, mid: m }, autoField: "upper" };
    return null;
  }
  if (u !== null && l !== null && m !== null) {
    const delta = m - (u + l) / 2;
    return { values: { upper: u + delta, lower: l + delta, mid: m }, autoField: null };
  }
  if (m !== null && u !== null) return { values: { upper: u, lower: 2 * m - u, mid: m }, autoField: "lower" };
  if (m !== null && l !== null) return { values: { upper: 2 * m - l, lower: l, mid: m }, autoField: "upper" };
  return null;
}
