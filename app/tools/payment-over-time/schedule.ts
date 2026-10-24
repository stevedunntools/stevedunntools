// Pure payment-schedule math for the payment-over-time calculator. Kept free
// of React so the amortization logic can be unit-tested directly.
//
// Model: a timeline measured in installment periods from the agreement date
// (day 0). Up-front payments fall wherever the user puts them (day 0 = at
// signing); installments begin one period after the last up-front payment
// (or after the agreement date when there are none). Interest accrues daily on
// the unpaid balance from a chosen start day, and every payment covers the
// interest accrued since the previous payment before it reduces principal.
// With interest starting at the agreement date and all up-fronts at signing
// this reduces exactly to textbook loan amortization.

import { fmt } from "@/lib/format";

export type Frequency = "monthly" | "quarterly" | "custom";
export type InterestScope = "installments" | "none";
/**
 * When the interest clock starts: the agreement date, a set number of days
 * after it (a deadline for papering a preliminary deal), or the date of the
 * first installment (so that installment is all principal — an annuity due).
 */
export type InterestStart = "agreement" | "days" | "first-installment";
export type InstallmentMode = "count" | "amount";

export interface ScheduleRow {
  label: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface UpfrontInput {
  amount: number;
  /** Days after the agreement date on which this payment is made; 0 = at signing. */
  days: number;
}

export interface ScheduleInput {
  totalSettlement: number;
  upfronts: UpfrontInput[];
  numPayments: number;
  installmentAmount: number;
  installmentMode: InstallmentMode;
  frequency: Frequency;
  customIntervalDays: number;
  interestScope: InterestScope;
  /** Annual interest rate as a percentage, e.g. 5 for 5%. */
  annualRate: number;
  interestStart: InterestStart;
  /** Used only when interestStart is "days". */
  interestStartDays: number;
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
  /** Length of one installment period in days (365/12, 365/4, or the custom interval). */
  periodDays: number;
  /** Day on which interest starts accruing, or null when no interest applies. */
  interestBeginsDay: number | null;
  /** Day of the latest up-front payment; installment 1 falls one period after it. */
  installmentsAnchorDay: number;
  warnings: string[];
}

/**
 * Hard cap on generated installment rows. Larger requests would build
 * hundreds of thousands of row objects and hang the page rendering them.
 */
export const MAX_INSTALLMENTS = 1200;

export function periodDaysFor(frequency: Frequency, customIntervalDays: number): number {
  if (frequency === "quarterly") return 365 / 4;
  if (frequency === "custom") return customIntervalDays > 0 ? customIntervalDays : 365 / 12;
  return 365 / 12;
}

function upfrontLabel(days: number): string {
  return days <= 0 ? "At signing" : `Day ${Math.round(days).toLocaleString()}`;
}

interface TimedUpfront {
  amount: number;
  days: number;
  /** Position on the timeline, in periods. */
  t: number;
}

/**
 * Final balance after `n` installments of `payment`, with no clamping, so the
 * result is an affine function of `payment`. Used to solve for the level
 * payment exactly from two evaluations.
 */
function finalBalanceLinear(
  total: number,
  upfronts: TimedUpfront[],
  n: number,
  payment: number,
  periodRate: number,
  startT: number,
  anchorT: number
): number {
  let balance = total;
  let accruedFrom = startT;
  let ui = 0;
  const accrue = (t: number) => {
    if (t > accruedFrom) {
      balance += balance * periodRate * (t - accruedFrom);
      accruedFrom = t;
    }
  };
  for (let i = 1; i <= n; i++) {
    const ti = anchorT + i;
    while (ui < upfronts.length && upfronts[ui].t <= ti) {
      accrue(upfronts[ui].t);
      balance -= upfronts[ui].amount;
      ui++;
    }
    accrue(ti);
    balance -= payment;
  }
  return balance;
}

export function buildSchedule(input: ScheduleInput): ScheduleResult {
  const {
    totalSettlement: total,
    installmentMode: mode,
    frequency: freq,
    customIntervalDays,
    interestScope: scope,
  } = input;
  const rate = input.annualRate / 100;
  const periodDays = periodDaysFor(freq, customIntervalDays);
  const periodRate = scope !== "none" && rate > 0 ? rate / (365 / periodDays) : 0;

  let periodLabel = "Month";
  if (freq === "quarterly") periodLabel = "Quarter";
  else if (freq === "custom") periodLabel = "Payment";

  // Up-fronts on the timeline, chronological; ties keep input order.
  const upfronts: TimedUpfront[] = input.upfronts
    .filter((u) => u.amount > 0)
    .map((u) => {
      const days = Math.max(0, u.days);
      return { amount: u.amount, days, t: days / periodDays };
    })
    .sort((a, b) => a.t - b.t);

  // Installments begin one period after the last up-front payment.
  const installmentsAnchorDay = upfronts.reduce((max, u) => Math.max(max, u.days), 0);
  const anchorT = installmentsAnchorDay / periodDays;

  // Interest start, in days and in periods.
  let interestBeginsDay: number | null = null;
  if (periodRate > 0) {
    if (input.interestStart === "days") interestBeginsDay = Math.max(0, input.interestStartDays);
    else if (input.interestStart === "first-installment") interestBeginsDay = installmentsAnchorDay + periodDays;
    else interestBeginsDay = 0;
  }
  const startT = interestBeginsDay === null ? 0 : interestBeginsDay / periodDays;

  const warnings: string[] = [];
  const empty = (): ScheduleResult => ({
    schedule: [],
    summary: { totalSettlement: total, totalPaid: 0, totalInterest: 0 },
    calculatedPayment: 0,
    calculatedCount: 0,
    periodDays,
    interestBeginsDay,
    installmentsAnchorDay,
    warnings,
  });

  // Custom frequency with no interval entered would silently fall back to
  // monthly math — warn instead of producing a misleading schedule.
  if (freq === "custom" && customIntervalDays <= 0) {
    warnings.push("Enter an interval in days for the custom frequency.");
    return empty();
  }

  // Flag (but still process) upfronts whose total exceeds the settlement
  const upfrontTotal = upfronts.reduce((sum, u) => sum + u.amount, 0);
  if (total > 0 && upfrontTotal > total + 0.005) {
    warnings.push(
      `Up-front payments (${fmt(upfrontTotal)}) exceed the settlement total (${fmt(total)}). The excess is not included in the schedule.`
    );
  }

  if (total <= 0) return empty();

  // ---------------------------------------------------------------------
  // Determine installment count and payment amount
  // ---------------------------------------------------------------------
  let n = Math.round(input.numPayments);
  let fixedPayment = 0;

  if (mode === "count" && n > 0) {
    if (n > MAX_INSTALLMENTS) {
      warnings.push(
        `Number of payments is capped at ${MAX_INSTALLMENTS.toLocaleString()}. The payment below pays the balance off within that limit.`
      );
      n = MAX_INSTALLMENTS;
    }
    // The final balance is affine in the payment, so two evaluations solve
    // for the level payment that lands exactly on zero.
    const f0 = finalBalanceLinear(total, upfronts, n, 0, periodRate, startT, anchorT);
    const f1 = finalBalanceLinear(total, upfronts, n, 1, periodRate, startT, anchorT);
    fixedPayment = f0 <= 0 ? 0 : f0 / (f0 - f1);
    // Whole cents, as the payment would be written into an agreement; the
    // last installment absorbs the rounding remainder.
    fixedPayment = Math.round(fixedPayment * 100) / 100;
  } else if (mode === "amount" && input.installmentAmount > 0) {
    fixedPayment = input.installmentAmount;
    n = MAX_INSTALLMENTS; // upper bound; the loop stops when the balance is paid
  } else {
    n = 0;
  }

  // ---------------------------------------------------------------------
  // Build the schedule
  // ---------------------------------------------------------------------
  const rows: ScheduleRow[] = [];
  let balance = total;
  let accruedFrom = startT;
  let totalInterest = 0;
  let totalPaid = 0;
  let ui = 0;
  let installmentCount = 0;

  /** Interest accrued on the current balance since the last payment up to time t. */
  const accrueTo = (t: number): number => {
    if (t <= accruedFrom) return 0;
    const interest = balance * periodRate * (t - accruedFrom);
    accruedFrom = t;
    return interest;
  };

  const applyUpfront = (u: TimedUpfront) => {
    const interest = accrueTo(u.t);
    const owed = balance + interest;
    if (owed <= 0) return; // nothing left to pay (covered by the "exceed" warning)
    const payment = Math.min(u.amount, owed);
    const principal = payment - interest;
    balance = Math.max(0, balance - principal);
    totalInterest += interest;
    totalPaid += payment;
    rows.push({ label: upfrontLabel(u.days), payment, principal, interest, balance });
  };

  if (fixedPayment > 0) {
    for (let i = 1; i <= n; i++) {
      const ti = anchorT + i;
      while (ui < upfronts.length && upfronts[ui].t <= ti) applyUpfront(upfronts[ui++]);
      if (balance <= 0) break;

      const interest = accrueTo(ti);
      let payment: number;
      let principal: number;

      if (mode === "count") {
        if (i === n) {
          principal = balance;
          payment = principal + interest;
        } else {
          payment = fixedPayment;
          principal = payment - interest;
        }
      } else {
        if (fixedPayment <= interest) {
          warnings.push(
            `Payment amount (${fmt(fixedPayment)}) is at or below the interest accrued per period (${fmt(interest)}). Increase the payment or lower the rate to produce a schedule.`
          );
          return empty();
        }
        if (fixedPayment >= balance + interest) {
          principal = balance;
          payment = principal + interest;
        } else {
          payment = fixedPayment;
          principal = payment - interest;
        }
      }

      balance = Math.max(0, balance - principal);
      totalInterest += interest;
      totalPaid += payment;
      installmentCount = i;
      rows.push({ label: `${periodLabel} ${i}`, payment, principal, interest, balance });

      if (mode === "amount" && balance <= 0) break;
    }

    if (mode === "amount" && balance > 0) {
      warnings.push(
        `At ${fmt(fixedPayment)} per payment the schedule would run past ${MAX_INSTALLMENTS.toLocaleString()} payments — only the first ${MAX_INSTALLMENTS.toLocaleString()} are shown, and a balance will remain.`
      );
    }
  } else {
    // No installments: up-front payments alone.
    while (ui < upfronts.length) applyUpfront(upfronts[ui++]);
  }

  // Every up-front precedes installment 1, so by here all have been applied
  // (those arriving after a zero balance are covered by the "exceed" warning).

  if (periodRate > 0 && rows.length > 0 && totalInterest === 0) {
    warnings.push("Interest begins on or after the final payment, so no interest accrues.");
  }

  return {
    schedule: rows,
    summary: { totalSettlement: total, totalPaid, totalInterest },
    calculatedPayment: fixedPayment,
    calculatedCount: installmentCount,
    periodDays,
    interestBeginsDay,
    installmentsAnchorDay,
    warnings,
  };
}
