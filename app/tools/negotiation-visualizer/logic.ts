// Pure data types and math for the negotiation visualizer. Kept free of React
// so the parsing and export logic can be unit-tested directly.

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

export function offerValues(m: Offer): { low: number; high: number; mid: number } {
  if (m.type === "number") return { low: m.value, high: m.value, mid: m.value };
  return { low: m.low, high: m.high, mid: (m.low + m.high) / 2 };
}

/**
 * Parse user input into an offer. Supports:
 *   "500000", "500,000", "-100,000", "0", "1234.56" → number offer
 *   "200000-400000", "-100,000-50,000", "100.5-200.5" → bracket
 * Anything else returns null (the caller shows an error) rather than being
 * silently truncated — a half-typed bracket like "200,000-" must not be
 * recorded as a firm $200,000 offer.
 */
export function parseInput(
  raw: string,
): { type: OfferType; value: number; low: number; high: number } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // A single offer amount: optional sign, digits/commas, optional cents
  const amount = "-?[\\d,]+(?:\\.\\d+)?";

  // Bracket: two amounts separated by a dash / en-dash / em-dash
  const bracketMatch = trimmed.match(
    new RegExp(`^[\\s$]*(${amount})\\s*[-–—]\\s*[\\s$]*(${amount})[\\s$]*$`),
  );
  if (bracketMatch) {
    const a = parseFloat(bracketMatch[1].replace(/,/g, ""));
    const b = parseFloat(bracketMatch[2].replace(/,/g, ""));
    if (isNaN(a) || isNaN(b)) return null;
    const low = Math.min(a, b);
    const high = Math.max(a, b);
    if (low === high) return null;
    return { type: "bracket", value: 0, low, high };
  }

  // Otherwise the whole input must be exactly one amount
  if (!new RegExp(`^[\\s$]*${amount}[\\s$]*$`).test(trimmed)) return null;
  const num = parseFloat(trimmed.replace(/[$,]/g, ""));
  if (isNaN(num)) return null;
  return { type: "number", value: num, low: 0, high: 0 };
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
    (a, b) =>
      a.round - b.round ||
      (a.party === b.party ? 0 : a.party === "plaintiff" ? -1 : 1),
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

/**
 * The round the next offer belongs to: the earliest round not yet filled by
 * both parties. (A round is open until both sides have offered, so deleting
 * an earlier offer re-opens that round to be filled rather than leaving a
 * permanent one-sided hole in the history.)
 */
export function nextRoundFor(offers: Offer[]): number {
  if (offers.length === 0) return 1;
  const lastRound = Math.max(...offers.map((m) => m.round));
  for (let r = 1; r <= lastRound; r++) {
    const roundOffers = offers.filter((m) => m.round === r);
    const hasPlaintiff = roundOffers.some((m) => m.party === "plaintiff");
    const hasDefendant = roundOffers.some((m) => m.party === "defendant");
    if (!hasPlaintiff || !hasDefendant) return r;
  }
  return lastRound + 1;
}
