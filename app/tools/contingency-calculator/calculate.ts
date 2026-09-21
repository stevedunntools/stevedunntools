/** Contingency fee math. Pure and unit-tested; the screen only formats. */
export interface ContingencyInput {
  settlement: number;
  /** Fee percentage, e.g. 33.333. */
  feePct: number;
  costs: number;
  /** Part of the settlement the fee is not charged on. */
  notCovered?: number;
}

export function calculateContingency({ settlement, feePct, costs, notCovered = 0 }: ContingencyInput) {
  const covered = Math.max(0, settlement - notCovered);
  // Round the fee to cents before deriving the net so the breakdown rows
  // always sum exactly to the settlement.
  const attorneyFee = Math.round(covered * feePct) / 100;
  const netToPlaintiff = settlement - attorneyFee - costs;
  return { covered, attorneyFee, netToPlaintiff };
}
