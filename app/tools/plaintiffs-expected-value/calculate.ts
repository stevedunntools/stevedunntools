/** Probability-weighted, time-discounted value of pressing on, net of what it costs. */
export interface ExpectedValueInput {
  damages: number;
  /** Chance of success, e.g. 60. */
  probabilityPct: number;
  yearsToPayment: number;
  /** Annual discount rate, e.g. 4. */
  discountRatePct: number;
  fees: number;
  litigationCosts: number;
  intangibleCosts: number;
}

export function calculateExpectedValue(i: ExpectedValueInput) {
  const probabilityAdjusted = i.damages * (i.probabilityPct / 100);
  const discountFactor = i.yearsToPayment > 0 ? 1 / Math.pow(1 + i.discountRatePct / 100, i.yearsToPayment) : 1;
  const discountedValue = probabilityAdjusted * discountFactor;
  const expectedValue = discountedValue - i.fees - i.litigationCosts - i.intangibleCosts;
  return { probabilityAdjusted, discountFactor, discountedValue, expectedValue };
}
