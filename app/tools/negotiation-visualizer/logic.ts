// Pure data types and math for the negotiation visualizer. Kept free of React
// so the parsing and projection logic can be unit-tested directly.

export type Party = "plaintiff" | "defendant";
export type OfferType = "number" | "bracket";

export interface Offer {
  id: string;
  round: number;
  party: Party;
  type: OfferType;
  value: number;
  low: number;
  high: number;
}

export interface Convergence {
  round: number;
  value: number;
  pStart: { round: number; value: number };
  dStart: { round: number; value: number };
}

export function offerValues(m: Offer): { low: number; high: number; mid: number } {
  if (m.type === "number") return { low: m.value, high: m.value, mid: m.value };
  return { low: m.low, high: m.high, mid: (m.low + m.high) / 2 };
}

/**
 * Parse user input into an offer. Supports:
 *   "500000", "500,000", "-100,000", "0" → number offer
 *   "200000-400000", "-100,000-50,000" → bracket
 */
export function parseInput(
  raw: string,
): { type: OfferType; value: number; low: number; high: number } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Bracket: two numbers (each optionally negative) separated by a dash / en-dash / em-dash
  const bracketMatch = trimmed.match(/^[\s$]*(-?[\d,]+)\s*[-–—]\s*[\s$]*(-?[\d,]+)\s*$/);
  if (bracketMatch) {
    const a = parseFloat(bracketMatch[1].replace(/,/g, ""));
    const b = parseFloat(bracketMatch[2].replace(/,/g, ""));
    if (isNaN(a) || isNaN(b)) return null;
    const low = Math.min(a, b);
    const high = Math.max(a, b);
    if (low === high) return null;
    return { type: "bracket", value: 0, low, high };
  }

  // Otherwise treat as a single number
  const num = parseFloat(trimmed.replace(/[$,]/g, ""));
  if (isNaN(num)) return null;
  return { type: "number", value: num, low: 0, high: 0 };
}

/** Each party's offers as (round, midpoint-value) points, sorted by round. */
function partySeries(offers: Offer[], party: Party): { round: number; value: number }[] {
  return offers
    .filter((m) => m.party === party)
    .sort((a, b) => a.round - b.round)
    .map((m) => ({ round: m.round, value: offerValues(m).mid }));
}

/** Ordinary least-squares fit of value vs. round. Null if degenerate. */
function fitLine(
  pts: { round: number; value: number }[],
): { slope: number; intercept: number } | null {
  if (pts.length < 2) return null;
  const n = pts.length;
  const meanX = pts.reduce((s, p) => s + p.round, 0) / n;
  const meanY = pts.reduce((s, p) => s + p.value, 0) / n;
  let cov = 0;
  let varX = 0;
  for (const p of pts) {
    cov += (p.round - meanX) * (p.value - meanY);
    varX += (p.round - meanX) ** 2;
  }
  if (varX === 0) return null;
  const slope = cov / varX;
  return { slope, intercept: meanY - slope * meanX };
}

/**
 * Projected convergence: a least-squares straight line through each party's
 * THREE most recent offers (bracket midpoints), extended forward to where the
 * two lines intersect. Returns null when either side has fewer than three
 * offers, the lines are parallel, or the intersection is not in the future.
 */
export function computeConvergence(offers: Offer[]): Convergence | null {
  const p = partySeries(offers, "plaintiff").slice(-3);
  const d = partySeries(offers, "defendant").slice(-3);
  if (p.length < 3 || d.length < 3) return null;

  const pFit = fitLine(p);
  const dFit = fitLine(d);
  if (!pFit || !dFit) return null;

  const slopeDiff = pFit.slope - dFit.slope;
  if (Math.abs(slopeDiff) < 1e-9) return null;

  const x = (dFit.intercept - pFit.intercept) / slopeDiff;
  const pLast = p[p.length - 1];
  const dLast = d[d.length - 1];
  const lastRound = Math.max(pLast.round, dLast.round);
  if (x <= lastRound) return null;

  return {
    round: x,
    value: pFit.slope * x + pFit.intercept,
    pStart: { round: pLast.round, value: pLast.value },
    dStart: { round: dLast.round, value: dLast.value },
  };
}

/** Offer as it appears in a JSON export: no internal ids, bracket midpoint included. */
export interface ExportedOffer {
  round: number;
  party: Party;
  type: OfferType;
  amount?: number;
  low?: number;
  high?: number;
  midpoint?: number;
}

export interface ExportData {
  tool: string;
  source: string;
  exportedAt: string;
  settled: boolean;
  settlementAmount: number | null;
  offers: ExportedOffer[];
}

/** Shape the visualizer's state for a JSON file export. */
export function buildExportData(
  offers: Offer[],
  settlement: number | null,
  exportedAt: string,
): ExportData {
  const sorted = [...offers].sort(
    (a, b) => a.round - b.round || (a.party === "plaintiff" ? -1 : 1),
  );
  return {
    tool: "Negotiation Visualizer",
    source: "stevedunntools.com",
    exportedAt,
    settled: settlement !== null,
    settlementAmount: settlement,
    offers: sorted.map((m) =>
      m.type === "number"
        ? { round: m.round, party: m.party, type: m.type, amount: m.value }
        : {
            round: m.round,
            party: m.party,
            type: m.type,
            low: m.low,
            high: m.high,
            midpoint: (m.low + m.high) / 2,
          },
    ),
  };
}

/** The round the next offer belongs to: a round is open until both parties have offered. */
export function nextRoundFor(offers: Offer[]): number {
  if (offers.length === 0) return 1;
  const lastRound = Math.max(...offers.map((m) => m.round));
  const lastRoundOffers = offers.filter((m) => m.round === lastRound);
  const hasPlaintiff = lastRoundOffers.some((m) => m.party === "plaintiff");
  const hasDefendant = lastRoundOffers.some((m) => m.party === "defendant");
  if (hasPlaintiff && hasDefendant) return lastRound + 1;
  return lastRound;
}
