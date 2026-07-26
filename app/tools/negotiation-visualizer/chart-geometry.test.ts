import { describe, it, expect } from "vitest";
import {
  buildBand,
  buildLineSegments,
  buildOfferMidpoints,
  computeOverlapPolygons,
} from "./chart-geometry";
import { Offer } from "./logic";

let nextId = 0;
function offer(
  party: "plaintiff" | "defendant",
  round: number,
  value: number | [number, number],
): Offer {
  const id = `t${nextId++}`;
  if (Array.isArray(value)) {
    return { id, party, round, type: "bracket", value: 0, low: value[0], high: value[1] };
  }
  return { id, party, round, type: "number", value, low: 0, high: 0 };
}

// Identity scales — geometry is tested in raw coordinates
const x = (n: number) => n;
const y = (n: number) => n;

describe("buildBand", () => {
  it("returns empty edges for no offers", () => {
    expect(buildBand([], x, y)).toEqual({ polygon: [], upperEdge: [], lowerEdge: [] });
  });

  it("builds upper/lower edges from offer low/high and a closed polygon", () => {
    const band = buildBand(
      [offer("plaintiff", 1, [400, 500]), offer("plaintiff", 2, [300, 450])],
      x,
      y,
    );
    expect(band.upperEdge).toEqual([
      { x: 1, y: 500 },
      { x: 2, y: 450 },
    ]);
    expect(band.lowerEdge).toEqual([
      { x: 1, y: 400 },
      { x: 2, y: 300 },
    ]);
    // Polygon = upper edge + reversed lower edge
    expect(band.polygon).toHaveLength(4);
    expect(band.polygon[3]).toEqual({ x: 1, y: 400 });
  });

  it("treats number offers as zero-height bands", () => {
    const band = buildBand([offer("plaintiff", 1, 500)], x, y);
    expect(band.upperEdge[0]).toEqual({ x: 1, y: 500 });
    expect(band.lowerEdge[0]).toEqual({ x: 1, y: 500 });
  });
});

describe("buildLineSegments", () => {
  it("uses solid segments between two number offers, dotted otherwise", () => {
    const offers = [
      offer("plaintiff", 1, 500),
      offer("plaintiff", 2, 400),
      offer("plaintiff", 3, [300, 400]),
    ];
    const { solid, dotted } = buildLineSegments(offers, x, y);
    expect(solid).toHaveLength(1);
    expect(dotted).toHaveLength(1);
    expect(solid[0][0]).toEqual({ x: 1, y: 500 });
    // Dotted segment connects midpoints: 400 → 350
    expect(dotted[0][1]).toEqual({ x: 3, y: 350 });
  });

  it("returns no segments for a single offer", () => {
    const { solid, dotted } = buildLineSegments([offer("plaintiff", 1, 500)], x, y);
    expect(solid).toHaveLength(0);
    expect(dotted).toHaveLength(0);
  });
});

describe("buildOfferMidpoints", () => {
  it("maps offers to midpoint points", () => {
    const pts = buildOfferMidpoints(
      [offer("defendant", 1, 100), offer("defendant", 2, [150, 250])],
      x,
      y,
    );
    expect(pts).toEqual([
      { x: 1, y: 100 },
      { x: 2, y: 200 },
    ]);
  });
});

describe("computeOverlapPolygons", () => {
  // computeOverlapPolygons samples every 2 x-units and expects chart-like
  // y coordinates (larger values map to smaller y), so scale accordingly.
  const X = (n: number) => n * 100;
  const Y = (n: number) => -n;

  it("returns nothing when either side has fewer than two offers", () => {
    const p = buildBand([offer("plaintiff", 1, [400, 500])], X, Y);
    const d = buildBand([offer("defendant", 1, [100, 200]), offer("defendant", 2, [200, 300])], X, Y);
    expect(computeOverlapPolygons(p, d)).toEqual([]);
  });

  it("returns nothing when the bands never overlap", () => {
    const p = buildBand(
      [offer("plaintiff", 1, [400, 500]), offer("plaintiff", 2, [400, 500])],
      X,
      Y,
    );
    const d = buildBand(
      [offer("defendant", 1, [100, 200]), offer("defendant", 2, [100, 200])],
      X,
      Y,
    );
    expect(computeOverlapPolygons(p, d)).toEqual([]);
  });

  it("finds the overlap region between crossing bands", () => {
    // Plaintiff band descends from [400,500] to [200,300]; defendant band
    // ascends from [100,200] to [300,400] — they overlap partway across.
    const p = buildBand(
      [offer("plaintiff", 1, [400, 500]), offer("plaintiff", 2, [200, 300])],
      X,
      Y,
    );
    const d = buildBand(
      [offer("defendant", 1, [100, 200]), offer("defendant", 2, [300, 400])],
      X,
      Y,
    );
    const polygons = computeOverlapPolygons(p, d);
    expect(polygons.length).toBeGreaterThan(0);
    // The overlap should be somewhere between the two rounds
    const xs = polygons[0].map((pt) => pt.x);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(100);
    expect(Math.max(...xs)).toBeLessThanOrEqual(200);
  });
});
