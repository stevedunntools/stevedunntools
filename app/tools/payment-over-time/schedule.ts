// Pure payment-schedule math for the payment-over-time calculator. Kept free
// of React so the amortization logic can be unit-tested directly.

import { fmt } from "@/lib/format";

export type Frequency = "monthly" | "quarterly" | "custom";
export type InterestScope = "installments" | "none";
export type InterestStart = "immediately" | "first-installment";
export type InstallmentMode = "count" | "amount";

export interface ScheduleRow {
  label: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface ScheduleInput {
  totalSettlement: number;
  upfronts: { amount: number; timing: string }[];
  numPayments: number;
  installmentAmount: number;
  installmentMode: InstallmentMode;
  frequency: Frequency;
  customIntervalDays: number;
  interestScope: InterestScope;
  interestStart: InterestStart;
  /** Annual interest rate as a percentage, e.g. 5 for 5%. */
  annualRate: number;
}

export interface ScheduleResult {
  schedule: ScheduleRow[];
  summary: {
    totalSettlement: number;
    totalPaid: number;
    totalInterest: number;
  };
  calculatedPayment: number;
  calculatedCount: number;
  warnings: string[];
}

export function buildSchedule(input: ScheduleInput): ScheduleResult {
  const {
    totalSettlement: total,
    upfronts,
    installmentMode: mode,
    frequency: freq,
    customIntervalDays,
    interestScope: scope,
    interestStart: startTiming,
  } = input;
  const rate = input.annualRate / 100;

  let periodsPerYear = 12;
  if (freq === "quarterly") periodsPerYear = 4;
  else if (freq === "custom") {
    periodsPerYear = customIntervalDays > 0 ? 365 / customIntervalDays : 12;
  }

  const periodRate = scope !== "none" ? rate / periodsPerYear : 0;

  let periodLabel = "Month";
  if (freq === "quarterly") periodLabel = "Quarter";
  else if (freq === "custom") periodLabel = "Payment";

  const rows: ScheduleRow[] = [];
  let balance = total;
  let totalInterest = 0;
  let totalPaid = 0;
  const warnings: string[] = [];

  // Flag (but still process) upfronts whose total exceeds the settlement
  const upfrontTotal = upfronts.reduce((sum, u) => sum + Math.max(0, u.amount), 0);
  if (total > 0 && upfrontTotal > total + 0.005) {
    warnings.push(
      `Up-front payments (${fmt(upfrontTotal)}) exceed the settlement total (${fmt(total)}). The excess is not included in the schedule.`
    );
  }

  // Up-front payments — treated as occurring at T=0 (no interest accrual).
  // Each upfront's principal is clamped to whatever balance remains.
  const upfrontCount = upfronts.filter((u) => u.amount > 0).length;
  for (const u of upfronts) {
    if (u.amount <= 0) continue;

    const principal = Math.min(u.amount, balance);
    if (principal <= 0) continue;
    const payment = principal;
    balance = Math.max(0, balance - principal);
    totalPaid += payment;

    rows.push({
      label: u.timing || "Up front",
      payment,
      principal,
      interest: 0,
      balance,
    });
  }

  // If interest starts immediately, accrue one period of interest on the
  // post-upfront balance before installments begin.
  if (scope === "installments" && startTiming === "immediately" && upfrontCount > 0 && periodRate > 0) {
    const accruedInterest = balance * periodRate;
    balance += accruedInterest;
    totalInterest += accruedInterest;

    rows.push({
      label: "Accrued interest",
      payment: 0,
      principal: 0,
      interest: accruedInterest,
      balance,
    });
  }

  // Determine installment count and payment amount
  let n = Math.round(input.numPayments);
  let fixedPayment = input.installmentAmount;
  const installmentRate = scope !== "none" ? periodRate : 0;

  let calcPayment = 0;
  let calcCount = 0;

  if (balance > 0) {
    if (mode === "count" && n > 0) {
      if (installmentRate > 0) {
        fixedPayment = (balance * installmentRate) / (1 - Math.pow(1 + installmentRate, -n));
      } else {
        fixedPayment = balance / n;
      }
      calcPayment = fixedPayment;
      calcCount = n;
    } else if (mode === "amount" && fixedPayment > 0) {
      if (installmentRate > 0) {
        const minPayment = balance * installmentRate;
        if (fixedPayment <= minPayment) {
          warnings.push(
            `Payment amount (${fmt(fixedPayment)}) is at or below the interest accrued per period (${fmt(minPayment)}). Increase the payment or lower the rate to produce a schedule.`
          );
          n = 0;
        } else {
          n = Math.ceil(
            -Math.log(1 - (balance * installmentRate) / fixedPayment) /
              Math.log(1 + installmentRate)
          );
        }
      } else {
        n = Math.ceil(balance / fixedPayment);
      }
      calcPayment = fixedPayment;
      calcCount = n;
    }

    for (let i = 1; i <= n; i++) {
      if (balance <= 0) break;

      const interest = balance * installmentRate;
      let principal: number;
      let payment: number;

      if (i === n) {
        principal = balance;
        payment = principal + interest;
      } else {
        payment = fixedPayment;
        principal = payment - interest;
      }

      balance = Math.max(0, balance - principal);
      totalInterest += interest;
      totalPaid += payment;

      rows.push({
        label: `${periodLabel} ${i}`,
        payment,
        principal,
        interest,
        balance: Math.max(0, balance),
      });
    }
  }

  return {
    schedule: rows,
    summary: {
      totalSettlement: total,
      totalPaid,
      totalInterest,
    },
    calculatedPayment: calcPayment,
    calculatedCount: calcCount,
    warnings,
  };
}
