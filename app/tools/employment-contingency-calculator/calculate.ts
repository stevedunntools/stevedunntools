/** Employment settlement fee math with the wage / non-wage split. */
export interface EmploymentContingencyInput {
  settlement: number;
  feePct: number;
  costs: number;
  /** Share of the net allocated to wages, e.g. 50. */
  wagesPct: number;
  notCovered?: number;
}

export function calculateEmploymentContingency({ settlement, feePct, costs, wagesPct, notCovered = 0 }: EmploymentContingencyInput) {
  const covered = Math.max(0, settlement - notCovered);
  // Round the fee and the wage split to cents at each step so every row sums
  // exactly to the row above it.
  const attorneyFee = Math.round(covered * feePct) / 100;
  const feeAndCosts = attorneyFee + costs;
  const netToPlaintiff = settlement - feeAndCosts;
  const wages = Math.round(netToPlaintiff * wagesPct) / 100;
  const nonWage = netToPlaintiff - wages;
  return { covered, attorneyFee, feeAndCosts, netToPlaintiff, wages, nonWage };
}
