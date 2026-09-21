/** What defending a case is expected to cost, win or lose. */
export interface ExpectedCostInput {
  damages: number;
  damagesProbabilityPct: number;
  plaintiffFees: number;
  feeProbabilityPct: number;
  defendantFees: number;
  defendantCosts: number;
  intangibleCosts: number;
}

export function calculateExpectedCost(i: ExpectedCostInput) {
  const expectedDamages = i.damages * (i.damagesProbabilityPct / 100);
  const expectedFeeExposure = i.plaintiffFees * (i.feeProbabilityPct / 100);
  const totalExpectedCost = expectedDamages + expectedFeeExposure + i.defendantFees + i.defendantCosts + i.intangibleCosts;
  return { expectedDamages, expectedFeeExposure, totalExpectedCost };
}
