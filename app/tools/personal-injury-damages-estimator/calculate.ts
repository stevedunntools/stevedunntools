/** Personal injury estimate: economic losses plus a multiple of medicals, less the plaintiff's share of fault. */
export interface PersonalInjuryInput {
  medicalToDate: number;
  futureMedical: number;
  lostEarningsToDate: number;
  futureLostEarnings: number;
  propertyDamage: number;
  /** Non-economic multiple of medical expenses, 1–5. */
  multiplier: number;
  /** Apply the multiple to past medicals only. */
  pastOnlyBase: boolean;
  /** Plaintiff's comparative fault, e.g. 20. */
  faultPct: number;
}

export const MULTIPLIER_MIN = 1;
export const MULTIPLIER_MAX = 5;

export function calculatePersonalInjury(i: PersonalInjuryInput) {
  const totalMedical = i.medicalToDate + i.futureMedical;
  const multiplierBase = i.pastOnlyBase ? i.medicalToDate : totalMedical;
  const economic = totalMedical + i.lostEarningsToDate + i.futureLostEarnings + i.propertyDamage;
  /** Total at a given multiple, after the comparative-fault reduction (rounded to cents). */
  const totalAt = (m: number) => {
    const gross = economic + multiplierBase * m;
    return gross - Math.round(gross * i.faultPct) / 100;
  };
  const painAndSuffering = multiplierBase * i.multiplier;
  const grossTotal = economic + painAndSuffering;
  const faultReduction = Math.round(grossTotal * i.faultPct) / 100;
  const total = grossTotal - faultReduction;
  const rangeLowMult = Math.max(MULTIPLIER_MIN, i.multiplier - 1);
  const rangeHighMult = Math.min(MULTIPLIER_MAX, i.multiplier + 1);
  return {
    totalMedical, multiplierBase, painAndSuffering, grossTotal, faultReduction, total,
    rangeLowMult, rangeHighMult, rangeLow: totalAt(rangeLowMult), rangeHigh: totalAt(rangeHighMult),
    showRange: multiplierBase > 0,
  };
}
