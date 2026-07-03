import { describe, it, expect } from "vitest";
import { computeIntersection, desiredMoves, TrendInputs } from "./logic";

// Steve's worked example: plaintiff 500k → 450k, defendant 50k → 75k.
// Gap of 375k closes at 75k per round → meet 5 moves later (round 7) at 200k.
const BASE: TrendInputs = { p1: 500000, p2: 450000, d1: 50000, d2: 75000 };

describe("computeIntersection", () => {
  it("projects converging trends to their intersection", () => {
    const r = computeIntersection(BASE);
    expect(r.converges).toBe(true);
    if (r.converges) {
      expect(r.intersectRound).toBeCloseTo(7, 5);
      expect(r.intersectValue).toBeCloseTo(200000, 5);
    }
  });

  it("handles fractional intersection rounds", () => {
    const r = computeIntersection({ p1: 500000, p2: 400000, d1: 50000, d2: 150000 });
    expect(r.converges).toBe(true);
    if (r.converges) {
      expect(r.intersectRound).toBeCloseTo(3.25, 5);
      expect(r.intersectValue).toBeCloseTo(275000, 5);
    }
  });

  it("reports parallel trends", () => {
    const r = computeIntersection({ p1: 500000, p2: 400000, d1: 100000, d2: 0 });
    expect(r.converges).toBe(false);
  });

  it("reports diverging trends", () => {
    const r = computeIntersection({ p1: 400000, p2: 500000, d1: 150000, d2: 50000 });
    expect(r.converges).toBe(false);
  });
});

describe("desiredMoves", () => {
  it("has the defendant enlarge when the target is above the projected intersection", () => {
    const r = desiredMoves(BASE, 250000);
    expect(r).toMatchObject({
      kind: "ok",
      adjustParty: "defendant",
      adjustNeeded: 35000, // (250k − 75k) / 5
      adjustCurrent: 25000,
      otherParty: "plaintiff",
      otherNeeded: 40000, // (450k − 250k) / 5
      otherCurrent: 50000,
      movesRemaining: 5,
    });
  });

  it("computes the hold-plaintiff-constant scenario", () => {
    const r = desiredMoves(BASE, 250000);
    expect(r?.kind).toBe("ok");
    if (r?.kind === "ok") {
      // Plaintiff at 50k/move reaches 250k in (450k − 250k)/50k = 4 moves;
      // defendant then needs (250k − 75k)/4 = 43,750 per move.
      expect(r.holdPlaintiff).toEqual({
        heldParty: "plaintiff",
        heldIncrement: 50000,
        movingParty: "defendant",
        neededIncrement: 43750,
        currentIncrement: 25000,
        moves: 4,
      });
    }
  });

  it("computes the hold-defendant-constant scenario", () => {
    const r = desiredMoves(BASE, 250000);
    expect(r?.kind).toBe("ok");
    if (r?.kind === "ok") {
      // Defendant at 25k/move reaches 250k in (250k − 75k)/25k = 7 moves;
      // plaintiff then needs (450k − 250k)/7 ≈ 28,571.43 per move.
      expect(r.holdDefendant).toMatchObject({
        heldParty: "defendant",
        heldIncrement: 25000,
        movingParty: "plaintiff",
        currentIncrement: 50000,
        moves: 7,
      });
      expect(r.holdDefendant!.neededIncrement).toBeCloseTo(200000 / 7, 5);
    }
  });

  it("omits a hold scenario when the held side isn't moving", () => {
    // Flat plaintiff: its line never reaches the target, so that scenario
    // is impossible; the defendant-constant scenario still works.
    const inputs: TrendInputs = { p1: 400000, p2: 400000, d1: 100000, d2: 200000 };
    const r = desiredMoves(inputs, 300000);
    expect(r?.kind).toBe("ok");
    if (r?.kind === "ok") {
      expect(r.holdPlaintiff).toBeNull();
      expect(r.holdDefendant).toMatchObject({
        heldParty: "defendant",
        movingParty: "plaintiff",
        neededIncrement: 100000, // (400k − 300k) / 1 move
        moves: 1,
      });
    }
  });

  it("has the plaintiff enlarge when the target is below the projected intersection", () => {
    const r = desiredMoves(BASE, 150000);
    expect(r).toMatchObject({
      kind: "ok",
      adjustParty: "plaintiff",
      adjustNeeded: 60000, // (450k − 150k) / 5
      adjustCurrent: 50000,
      otherParty: "defendant",
      otherNeeded: 15000, // (150k − 75k) / 5
      otherCurrent: 25000,
    });
  });

  it("works with fractional moves remaining", () => {
    const inputs: TrendInputs = { p1: 500000, p2: 400000, d1: 50000, d2: 150000 };
    const r = desiredMoves(inputs, 300000); // above V=275k → defendant enlarges
    expect(r).toMatchObject({
      kind: "ok",
      adjustParty: "defendant",
      otherParty: "plaintiff",
      movesRemaining: 1.25,
    });
    if (r?.kind === "ok") {
      expect(r.adjustNeeded).toBeCloseTo(120000, 5); // (300k − 150k) / 1.25
      expect(r.otherNeeded).toBeCloseTo(80000, 5); // (400k − 300k) / 1.25
    }
  });

  it("rejects targets outside the parties' most recent offers", () => {
    expect(desiredMoves(BASE, 500000)).toEqual({ kind: "outside", low: 75000, high: 450000 });
    expect(desiredMoves(BASE, 50000)).toEqual({ kind: "outside", low: 75000, high: 450000 });
    // Endpoints themselves are excluded
    expect(desiredMoves(BASE, 450000)).toEqual({ kind: "outside", low: 75000, high: 450000 });
  });

  it("recognizes a target that equals the projected intersection", () => {
    expect(desiredMoves(BASE, 200000)).toEqual({ kind: "already-there" });
  });

  it("reports no moves left when the trends meet at the latest offers", () => {
    const inputs: TrendInputs = { p1: 300000, p2: 200000, d1: 100000, d2: 200000 };
    expect(desiredMoves(inputs, 200000)).toEqual({ kind: "no-moves-left" });
  });

  it("returns null when the trends don't converge at all", () => {
    const diverging: TrendInputs = { p1: 400000, p2: 500000, d1: 150000, d2: 50000 };
    expect(desiredMoves(diverging, 250000)).toBeNull();
  });
});
