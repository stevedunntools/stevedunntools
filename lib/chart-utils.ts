/** A 2D point for SVG chart rendering */
export interface Pt {
  x: number;
  y: number;
}

// ---------------------------------------------------------------------------
// Shared chart geometry + palette (negotiation visualizer, convergence calc)
// ---------------------------------------------------------------------------

export const CHART_W = 800;
export const CHART_H = 420;
export const PAD = { top: 20, right: 30, bottom: 50, left: 80 };
export const INNER_W = CHART_W - PAD.left - PAD.right;
export const INNER_H = CHART_H - PAD.top - PAD.bottom;

export const BLUE = "#4A90D9";
export const RED = "#DC2626";
export const GREEN = "#16A34A";

/** Convert an array of points to an SVG path string */
export function pointsToPath(pts: Pt[], closed: boolean = false): string {
  if (pts.length === 0) return "";
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  return closed ? d + " Z" : d;
}

/** Generate Y-axis tick values for a given range. Returns sensible defaults for degenerate ranges. */
export function generateYTicks(yMin: number, yMax: number, targetCount: number = 5): number[] {
  const range = yMax - yMin;
  if (range <= 0) return [yMin];

  const rawStep = range / targetCount;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  if (mag <= 0) return [yMin];

  const step = Math.ceil(rawStep / mag) * mag;
  if (step <= 0) return [yMin];

  const ticks: number[] = [];
  let v = Math.ceil(yMin / step) * step;
  while (v <= yMax && ticks.length < 20) {
    ticks.push(v);
    v += step;
  }
  return ticks.length > 0 ? ticks : [yMin];
}

/** Format a dollar value for Y-axis labels (e.g. "$500k", "$1.5M", "-$500k") */
export function formatTickLabel(v: number): string {
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  // Round to the nearest thousand first so values like $999,600 become
  // "$1.0M" instead of "$1000k".
  if (Math.round(abs / 1000) >= 1000) {
    return `${sign}$${(abs / 1000000).toFixed(abs % 1000000 === 0 ? 0 : 1)}M`;
  }
  if (abs >= 1000) {
    return `${sign}$${Math.round(abs / 1000)}k`;
  }
  return `${sign}$${abs}`;
}
