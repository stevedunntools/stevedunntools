// Pure math for the Point of Intersection tool. Kept free of React so the
// projection and desired-settlement logic can be unit-tested directly.
//
// Rounds are numbered so each side's first offer is round 1 and its second
// offer is round 2; slopes are dollars per round.

export interface TrendInputs {
  p1: number;
  p2: number;
  d1: number;
  d2: number;
}

export type IntersectionResult =
  | { converges: false; reason: string }
  | { converges: true; intersectRound: number; intersectValue: number };

export function computeIntersection({ p1, p2, d1, d2 }: TrendInputs): IntersectionResult {
  const pSlope = p2 - p1;
  const dSlope = d2 - d1;
  const slopeDiff = pSlope - dSlope;

  if (Math.abs(slopeDiff) < Math.abs(Math.max(pSlope, dSlope, 1)) * 1e-10) {
    if (Math.abs(p1 - d1) < 0.01) {
      return { converges: false, reason: "Offers are identical — no convergence needed." };
    }
    return { converges: false, reason: "Trends are parallel and will not intersect." };
  }

  const r = 1 + (d1 - p1) / slopeDiff;
  if (r < 2) {
    return { converges: false, reason: "Trends are diverging — no future convergence." };
  }

  return { converges: true, intersectRound: r, intersectValue: p1 + pSlope * (r - 1) };
}

export type Party = "plaintiff" | "defendant";

/**
 * Hold-one-side-constant scenario: the held party keeps its current per-move
 * increment, so the meeting happens where that party's own line reaches the
 * target — generally after a DIFFERENT number of moves — and the other party's
 * increment is whatever covers its distance in that many moves.
 */
export interface HoldScenario {
  heldParty: Party;
  heldIncrement: number;
  movingParty: Party;
  neededIncrement: number;
  currentIncrement: number;
  /** Moves after each side's second offer until the meeting (may be fractional). */
  moves: number;
}

export type DesiredMovesResult =
  | { kind: "outside"; low: number; high: number }
  | { kind: "already-there" }
  | { kind: "no-moves-left" }
  | {
      kind: "ok";
      /** The side that must ENLARGE its per-move increment to reach the target. */
      adjustParty: Party;
      adjustNeeded: number;
      adjustCurrent: number;
      /** The other side, whose increment shrinks under the same-round meeting. */
      otherParty: Party;
      otherNeeded: number;
      otherCurrent: number;
      /** Moves remaining after each side's second offer (may be fractional). */
      movesRemaining: number;
      /** Scenario where the plaintiff's increment stays constant, if reachable. */
      holdPlaintiff: HoldScenario | null;
      /** Scenario where the defendant's increment stays constant, if reachable. */
      holdDefendant: HoldScenario | null;
    };

/**
 * Option-1 desired-settlement analysis: keep the meeting round fixed at the
 * current projected intersection and work backward from (round, target) to
 * each side's required per-move increment. Exactly one side must enlarge its
 * moves (the side the target favors less); the other side's moves shrink.
 *
 * Returns null when the current inputs don't converge at all.
 */
export function desiredMoves(inputs: TrendInputs, target: number): DesiredMovesResult | null {
  const res = computeIntersection(inputs);
  if (!res.converges) return null;

  const movesRemaining = res.intersectRound - 2;
  if (movesRemaining <= 1e-9) return { kind: "no-moves-left" };

  const low = Math.min(inputs.p2, inputs.d2);
  const high = Math.max(inputs.p2, inputs.d2);
  if (target <= low || target >= high) return { kind: "outside", low, high };

  if (Math.abs(target - res.intersectValue) < 0.5) return { kind: "already-there" };

  const pNeeded = Math.abs(inputs.p2 - target) / movesRemaining;
  const dNeeded = Math.abs(target - inputs.d2) / movesRemaining;
  const pCurrent = Math.abs(inputs.p2 - inputs.p1);
  const dCurrent = Math.abs(inputs.d2 - inputs.d1);

  // Hold-one-side scenarios: the held side's line must actually reach the
  // target moving forward (a flat or receding side never does).
  function holdScenario(
    heldParty: Party,
    heldLast: number,
    heldSlope: number,
    movingParty: Party,
    movingLast: number,
    movingCurrent: number,
  ): HoldScenario | null {
    if (Math.abs(heldSlope) < 1e-9) return null;
    const moves = (target - heldLast) / heldSlope;
    if (moves <= 1e-9) return null;
    return {
      heldParty,
      heldIncrement: Math.abs(heldSlope),
      movingParty,
      neededIncrement: Math.abs(target - movingLast) / moves,
      currentIncrement: movingCurrent,
      moves,
    };
  }

  const holdPlaintiff = holdScenario(
    "plaintiff", inputs.p2, inputs.p2 - inputs.p1, "defendant", inputs.d2, dCurrent,
  );
  const holdDefendant = holdScenario(
    "defendant", inputs.d2, inputs.d2 - inputs.d1, "plaintiff", inputs.p2, pCurrent,
  );

  // Both current lines pass through the intersection, so |current increment|
  // equals |V - lastOffer| / movesRemaining. A target strictly between V and
  // the plaintiff's last offer is farther from the defendant — the defendant
  // enlarges — and vice versa. Exactly one side's needed increment grows.
  if (pNeeded > pCurrent) {
    return {
      kind: "ok",
      adjustParty: "plaintiff",
      adjustNeeded: pNeeded,
      adjustCurrent: pCurrent,
      otherParty: "defendant",
      otherNeeded: dNeeded,
      otherCurrent: dCurrent,
      movesRemaining,
      holdPlaintiff,
      holdDefendant,
    };
  }
  return {
    kind: "ok",
    adjustParty: "defendant",
    adjustNeeded: dNeeded,
    adjustCurrent: dCurrent,
    otherParty: "plaintiff",
    otherNeeded: pNeeded,
    otherCurrent: pCurrent,
    movesRemaining,
    holdPlaintiff,
    holdDefendant,
  };
}
