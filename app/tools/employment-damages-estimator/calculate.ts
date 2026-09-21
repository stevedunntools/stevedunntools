export type LiquidatedType = "none" | "2x-wages" | "2x-wages-benefits" | "3x-wages";

export interface MitigationJobInput {
  months: number;
  monthlyComp: number;
  monthlyBenefits: number;
  current: boolean;
}

export interface EmploymentDamagesInput {
  monthlyComp: number;
  monthlyBenefits: number;
  monthsSinceTermination: number;
  jobs: MitigationJobInput[];
  frontPayMonths: number;
  compensatory: number;
  liquidatedType: LiquidatedType;
  punitive: number;
  otherDamages: number;
}

/** Back pay less mitigation, front pay offset by the current job, liquidated multiples on the net. */
export function calculateEmploymentDamages(i: EmploymentDamagesInput) {
  const backPayComp = i.monthlyComp * i.monthsSinceTermination;
  const backPayBenefits = i.monthlyBenefits * i.monthsSinceTermination;
  const backPay = backPayComp + backPayBenefits;

  const totalMitigation = i.jobs.reduce((sum, j) => sum + j.months * (j.monthlyComp + j.monthlyBenefits), 0);
  const netBackPay = Math.max(0, backPay - totalMitigation);

  const currentJob = i.jobs.find((j) => j.current);
  const currentJobComp = currentJob ? currentJob.monthlyComp + currentJob.monthlyBenefits : 0;
  const frontPay = Math.max(0, i.monthlyComp + i.monthlyBenefits - currentJobComp) * i.frontPayMonths;

  // Liquidated damages on net (post-mitigation) back pay; mitigation is
  // allocated proportionally between the wage and benefit components.
  const mitigationRatio = backPay > 0 ? netBackPay / backPay : 0;
  const netBackPayComp = backPayComp * mitigationRatio;
  const liquidated =
    i.liquidatedType === "2x-wages" ? netBackPayComp
    : i.liquidatedType === "2x-wages-benefits" ? netBackPay
    : i.liquidatedType === "3x-wages" ? netBackPayComp * 2
    : 0;

  const grossTotal = netBackPay + frontPay + i.compensatory + liquidated + i.punitive + i.otherDamages;
  return { backPayComp, backPayBenefits, backPay, totalMitigation, netBackPay, frontPay, liquidated, grossTotal };
}
