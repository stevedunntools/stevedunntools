/** A 2D point for SVG chart rendering */
export interface Pt {
  x: number;
  y: number;
}

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

/** Format a dollar value for Y-axis labels (e.g. "$500k", "$1.5M") */
export function formatTickLabel(v: number): string {
  if (v >= 1000000) {
    return `$${(v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1)}M`;
  }
  if (v >= 1000) {
    return `$${(v / 1000).toFixed(0)}k`;
  }
  return `$${v}`;
}
