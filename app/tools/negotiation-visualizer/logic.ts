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

// Linear projection through the last two offers of each party.
// Returns null if there are fewer than two offers per party, the lines are
// parallel, or the intersection is not in the future.
export function computeConvergence(offers: Offer[]): Convergence | null {
  const pOffers = offers
    .filter((m) => m.party === "plaintiff")
    .sort((a, b) => a.round - b.round);
  const dOffers = offers
    .filter((m) => m.party === "defendant")
    .sort((a, b) => a.round - b.round);
  if (pOffers.length < 2 || dOffers.length < 2) return null;

  const p1 = pOffers[pOffers.length - 2];
  const p2 = pOffers[pOffers.length - 1];
  const d1 = dOffers[dOffers.length - 2];
  const d2 = dOffers[dOffers.length - 1];

  if (p1.round === p2.round || d1.round === d2.round) return null;

  const pV1 = offerValues(p1).mid;
  const pV2 = offerValues(p2).mid;
  const dV1 = offerValues(d1).mid;
  const dV2 = offerValues(d2).mid;

  const pSlope = (pV2 - pV1) / (p2.round - p1.round);
  const dSlope = (dV2 - dV1) / (d2.round - d1.round);

  const slopeDiff = pSlope - dSlope;
  if (Math.abs(slopeDiff) < 1e-9) return null;

  const pIntercept = pV2 - pSlope * p2.round;
  const dIntercept = dV2 - dSlope * d2.round;

  const x = (dIntercept - pIntercept) / slopeDiff;
  const lastRound = Math.max(p2.round, d2.round);
  if (x <= lastRound) return null;

  const y = pSlope * x + pIntercept;

  return {
    round: x,
    value: y,
    pStart: { round: p2.round, value: pV2 },
    dStart: { round: d2.round, value: dV2 },
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
