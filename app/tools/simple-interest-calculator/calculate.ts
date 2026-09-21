export type TimeUnit = "years" | "months" | "days";

/** Simple (non-compounding) interest; days use a 365-day year. */
export function calculateSimpleInterest(principal: number, annualRatePct: number, time: number, unit: TimeUnit) {
  const timeInYears = unit === "years" ? time : unit === "months" ? time / 12 : time / 365;
  const interest = principal * (annualRatePct / 100) * timeInYears;
  return { timeInYears, interest, total: principal + interest };
}
