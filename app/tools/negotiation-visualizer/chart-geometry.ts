import { Pt } from "@/lib/chart-utils";
import { Offer, offerValues } from "./logic";

// ---------------------------------------------------------------------------
// Chart geometry helpers (pure — operate on already-scaled coordinates)
// ---------------------------------------------------------------------------

export type Scale = (n: number) => number;

export interface Band {
  polygon: Pt[];
  upperEdge: Pt[];
  lowerEdge: Pt[];
}

export function buildBand(
  partyOffers: Offer[],
  xScale: Scale,
  yScale: Scale,
): Band {
  if (partyOffers.length === 0) return { polygon: [], upperEdge: [], lowerEdge: [] };

  const upperEdge: Pt[] = [];
  const lowerEdge: Pt[] = [];

  for (const m of partyOffers) {
    const v = offerValues(m);
    const x = xScale(m.round);
    upperEdge.push({ x, y: yScale(v.high) });
    lowerEdge.push({ x, y: yScale(v.low) });
  }

  const polygon = [...upperEdge, ...[...lowerEdge].reverse()];
  return { polygon, upperEdge, lowerEdge };
}

export function buildLineSegments(
  partyOffers: Offer[],
  xScale: Scale,
  yScale: Scale,
): { solid: Pt[][]; dotted: Pt[][] } {
  const solid: Pt[][] = [];
  const dotted: Pt[][] = [];
  for (let i = 0; i < partyOffers.length - 1; i++) {
    const a = partyOffers[i];
    const b = partyOffers[i + 1];
    const aVal = offerValues(a);
    const bVal = offerValues(b);
    const p1: Pt = { x: xScale(a.round), y: yScale(aVal.mid) };
    const p2: Pt = { x: xScale(b.round), y: yScale(bVal.mid) };

    if (a.type === "number" && b.type === "number") {
      solid.push([p1, p2]);
    } else {
      dotted.push([p1, p2]);
    }
  }
  return { solid, dotted };
}

export function buildOfferMidpoints(partyOffers: Offer[], xScale: Scale, yScale: Scale): Pt[] {
  return partyOffers.map((m) => {
    const v = offerValues(m);
    return { x: xScale(m.round), y: yScale(v.mid) };
  });
}

/** Geometric intersection of the two band polygons */
export function computeOverlapPolygons(pBand: Band, dBand: Band): Pt[][] {
  if (pBand.upperEdge.length < 2 || dBand.upperEdge.length < 2) return [];

  const pMinX = pBand.upperEdge[0].x;
  const pMaxX = pBand.upperEdge[pBand.upperEdge.length - 1].x;
  const dMinX = dBand.upperEdge[0].x;
  const dMaxX = dBand.upperEdge[dBand.upperEdge.length - 1].x;
  const rangeMinX = Math.max(pMinX, dMinX);
  const rangeMaxX = Math.min(pMaxX, dMaxX);

  if (rangeMinX >= rangeMaxX) return [];

  function interpEdge(edge: Pt[], x: number): number {
    if (x <= edge[0].x) return edge[0].y;
    if (x >= edge[edge.length - 1].x) return edge[edge.length - 1].y;
    for (let i = 0; i < edge.length - 1; i++) {
      if (x >= edge[i].x && x <= edge[i + 1].x) {
        const t = (x - edge[i].x) / (edge[i + 1].x - edge[i].x);
        return edge[i].y + t * (edge[i + 1].y - edge[i].y);
      }
    }
    return edge[edge.length - 1].y;
  }

  const STEP = 2;
  const samples: { x: number; topY: number; botY: number; has: boolean }[] = [];

  for (let x = rangeMinX; x <= rangeMaxX; x += STEP) {
    const pTopY = interpEdge(pBand.upperEdge, x);
    const pBotY = interpEdge(pBand.lowerEdge, x);
    const dTopY = interpEdge(dBand.upperEdge, x);
    const dBotY = interpEdge(dBand.lowerEdge, x);

    const topY = Math.max(pTopY, dTopY);
    const botY = Math.min(pBotY, dBotY);

    samples.push({ x, topY, botY, has: topY < botY - 0.5 });
  }

  if (samples.length > 0 && samples[samples.length - 1].x < rangeMaxX) {
    const x = rangeMaxX;
    const pTopY = interpEdge(pBand.upperEdge, x);
    const pBotY = interpEdge(pBand.lowerEdge, x);
    const dTopY = interpEdge(dBand.upperEdge, x);
    const dBotY = interpEdge(dBand.lowerEdge, x);
    const topY = Math.max(pTopY, dTopY);
    const botY = Math.min(pBotY, dBotY);
    samples.push({ x, topY, botY, has: topY < botY - 0.5 });
  }

  const polygons: Pt[][] = [];
  let currentUpper: Pt[] = [];
  let currentLower: Pt[] = [];

  for (const s of samples) {
    if (s.has) {
      currentUpper.push({ x: s.x, y: s.topY });
      currentLower.push({ x: s.x, y: s.botY });
    } else {
      if (currentUpper.length >= 2) {
        polygons.push([...currentUpper, ...[...currentLower].reverse()]);
      }
      currentUpper = [];
      currentLower = [];
    }
  }
  if (currentUpper.length >= 2) {
    polygons.push([...currentUpper, ...[...currentLower].reverse()]);
  }

  return polygons;
}
