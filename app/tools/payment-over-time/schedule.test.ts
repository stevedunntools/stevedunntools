import { describe, it, expect } from "vitest";
import { buildSchedule, ScheduleInput } from "./schedule";

function input(overrides: Partial<ScheduleInput>): ScheduleInput {
  return {
    totalSettlement: 0,
    upfronts: [],
    numPayments: 0,
    installmentAmount: 0,
    installmentMode: "count",
    frequency: "monthly",
    customIntervalDays: 0,
    interestScope: "none",
    annualRate: 5,
    interestStart: "agreement",
    interestStartDays: 0,
    ...overrides,
  };
}

/** Ordinary-annuity level payment: interest accrues from day 0, payments at period end. */
function annuityPayment(principal: number, r: number, n: number) {
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

describe("buildSchedule — count mode, no interest", () => {
  const result = buildSchedule(
    input({ totalSettlement: 120000, numPayments: 12 })
  );

  it("splits the settlement into equal payments", () => {
    expect(result.schedule).toHaveLength(12);
    expect(result.calculatedPayment).toBeCloseTo(10000, 5);
    for (const row of result.schedule) {
      expect(row.payment).toBeCloseTo(10000, 5);
      expect(row.interest).toBe(0);
    }
  });

  it("pays off exactly with no interest", () => {
    expect(result.schedule[11].balance).toBeCloseTo(0, 5);
    expect(result.summary.totalPaid).toBeCloseTo(120000, 5);
    expect(result.summary.totalInterest).toBe(0);
    expect(result.interestBeginsDay).toBeNull();
  });
});

describe("buildSchedule — up-front payments", () => {
  it("applies upfronts at T=0 before installments", () => {
    const result = buildSchedule(
      input({
        totalSettlement: 100000,
        upfronts: [{ amount: 25000, days: 0 }],
        numPayments: 3,
      })
    );
    expect(result.schedule[0].label).toBe("At signing");
    expect(result.schedule[0].payment).toBe(25000);
    expect(result.schedule[0].balance).toBe(75000);
    expect(result.calculatedPayment).toBeCloseTo(25000, 5);
    expect(result.summary.totalPaid).toBeCloseTo(100000, 5);
  });

  it("clamps an upfront that exceeds the settlement and warns", () => {
    const result = buildSchedule(
      input({
        totalSettlement: 50000,
        upfronts: [{ amount: 60000, days: 0 }],
        numPayments: 6,
      })
    );
    expect(result.warnings).toHaveLength(1);
    expect(result.schedule).toHaveLength(1);
    expect(result.schedule[0].payment).toBe(50000);
    expect(result.schedule[0].balance).toBe(0);
  });

  it("charges a delayed upfront the interest accrued before it", () => {
    // $100,000 at 12% (1%/month). $25,000 paid on day 15 — about half a
    // month in — owes interest on the full balance for that half month.
    const periodDays = 365 / 12;
    const result = buildSchedule(
      input({
        totalSettlement: 100000,
        upfronts: [{ amount: 25000, days: 15 }],
        numPayments: 3,
        interestScope: "installments",
        annualRate: 12,
      })
    );
    const upfront = result.schedule[0];
    const expectedInterest = 100000 * 0.01 * (15 / periodDays);
    expect(upfront.label).toBe("Day 15");
    expect(upfront.payment).toBe(25000);
    expect(upfront.interest).toBeCloseTo(expectedInterest, 6);
    expect(upfront.principal).toBeCloseTo(25000 - expectedInterest, 6);

    // Month 1 falls one month after the up-front, so it carries a full month
    // of interest on the reduced balance.
    const month1 = result.schedule[1];
    expect(month1.label).toBe("Month 1");
    expect(month1.interest).toBeCloseTo(upfront.balance * 0.01, 6);
    expect(result.installmentsAnchorDay).toBe(15);

    // And the level payment still retires the balance on the last installment.
    expect(result.schedule).toHaveLength(4);
    expect(result.schedule[3].balance).toBeCloseTo(0, 5);
    expect(result.summary.totalPaid).toBeCloseTo(100000 + result.summary.totalInterest, 5);
  });

  it("starts installments after the last upfront, in chronological order", () => {
    // $25,000 in 30 days and $25,000 in 60 days: Month 1 must follow both.
    const result = buildSchedule(
      input({
        totalSettlement: 100000,
        upfronts: [
          { amount: 25000, days: 60 },
          { amount: 25000, days: 30 },
        ],
        numPayments: 2,
      })
    );
    expect(result.schedule.map((r) => r.label)).toEqual([
      "Day 30",
      "Day 60",
      "Month 1",
      "Month 2",
    ]);
    expect(result.installmentsAnchorDay).toBe(60);
    expect(result.calculatedPayment).toBeCloseTo(25000, 5);
    expect(result.schedule[3].balance).toBeCloseTo(0, 5);
  });

  it("accrues interest through the upfront period before installments begin", () => {
    // 12%: 0→30 days on $100k, 30→60 on $75k, then a full month on $50k.
    const periodDays = 365 / 12;
    const result = buildSchedule(
      input({
        totalSettlement: 100000,
        upfronts: [
          { amount: 25000, days: 30 },
          { amount: 25000, days: 60 },
        ],
        numPayments: 2,
        interestScope: "installments",
        annualRate: 12,
      })
    );
    const [u1, u2, m1] = result.schedule;
    expect(u1.interest).toBeCloseTo(100000 * 0.01 * (30 / periodDays), 6);
    expect(u2.interest).toBeCloseTo(u1.balance * 0.01 * (30 / periodDays), 6);
    expect(m1.interest).toBeCloseTo(u2.balance * 0.01, 6);
    expect(result.schedule[3].balance).toBeCloseTo(0, 5);
    expect(result.summary.totalPaid).toBeCloseTo(100000 + result.summary.totalInterest, 5);
  });

  it("measures the first-installment interest start from the last upfront", () => {
    const result = buildSchedule(
      input({
        totalSettlement: 100000,
        upfronts: [{ amount: 20000, days: 60 }],
        numPayments: 3,
        interestScope: "installments",
        annualRate: 12,
        interestStart: "first-installment",
      })
    );
    expect(result.interestBeginsDay).toBeCloseTo(60 + 365 / 12, 9);
    // Neither the upfront nor Month 1 carries interest; Month 2 does.
    expect(result.schedule[0].interest).toBe(0);
    expect(result.schedule[1].interest).toBe(0);
    expect(result.schedule[2].interest).toBeGreaterThan(0);
  });
});

describe("buildSchedule — amount mode", () => {
  it("derives the payment count with a smaller final payment", () => {
    const result = buildSchedule(
      input({
        totalSettlement: 100000,
        installmentMode: "amount",
        installmentAmount: 30000,
      })
    );
    expect(result.calculatedCount).toBe(4);
    expect(result.schedule.map((r) => r.payment)).toEqual([
      30000, 30000, 30000, 10000,
    ]);
    expect(result.summary.totalPaid).toBeCloseTo(100000, 5);
  });

  it("matches the closed-form count when interest applies", () => {
    // 100,000 at 12%, $10,000/month → n = ceil(-ln(1 - B·r/P) / ln(1+r))
    const result = buildSchedule(
      input({
        totalSettlement: 100000,
        installmentMode: "amount",
        installmentAmount: 10000,
        interestScope: "installments",
        annualRate: 12,
      })
    );
    const r = 0.01;
    const expectedN = Math.ceil(-Math.log(1 - (100000 * r) / 10000) / Math.log(1 + r));
    expect(result.calculatedCount).toBe(expectedN);
    expect(result.schedule[result.schedule.length - 1].balance).toBeCloseTo(0, 5);
    expect(result.schedule[result.schedule.length - 1].payment).toBeLessThan(10000);
  });

  it("warns when the payment cannot outpace interest", () => {
    // 120,000 at 12% annual → 1,200/month interest; a 1,000 payment never amortizes
    const result = buildSchedule(
      input({
        totalSettlement: 120000,
        installmentMode: "amount",
        installmentAmount: 1000,
        interestScope: "installments",
        annualRate: 12,
      })
    );
    expect(result.warnings).toHaveLength(1);
    expect(result.schedule).toHaveLength(0);
    expect(result.calculatedCount).toBe(0);
  });
});

describe("buildSchedule — amortization with interest", () => {
  const result = buildSchedule(
    input({
      totalSettlement: 120000,
      numPayments: 12,
      interestScope: "installments",
      annualRate: 12,
    })
  );

  it("computes the standard annuity payment", () => {
    // PMT = P·r / (1 − (1+r)^−n) with r = 1% monthly
    expect(result.calculatedPayment).toBeCloseTo(annuityPayment(120000, 0.01, 12), 2);
    expect(result.interestBeginsDay).toBe(0);
  });

  it("charges a full period of interest on the first installment", () => {
    expect(result.schedule[0].interest).toBeCloseTo(1200, 6);
  });

  it("amortizes to a zero balance", () => {
    expect(result.schedule[11].balance).toBeCloseTo(0, 5);
  });

  it("keeps totals consistent: total paid = principal + interest", () => {
    expect(result.summary.totalPaid).toBeCloseTo(
      120000 + result.summary.totalInterest,
      5
    );
  });

  it("declines interest and grows principal over the schedule", () => {
    expect(result.schedule[0].interest).toBeGreaterThan(result.schedule[10].interest);
    expect(result.schedule[0].principal).toBeLessThan(result.schedule[10].principal);
  });
});

describe("buildSchedule — when interest begins", () => {
  const base = {
    totalSettlement: 120000,
    numPayments: 12,
    interestScope: "installments" as const,
    annualRate: 12,
  };
  const ordinary = buildSchedule(input(base));

  it("with the first installment: that installment is all principal (annuity due)", () => {
    const result = buildSchedule(input({ ...base, interestStart: "first-installment" }));
    expect(result.interestBeginsDay).toBeCloseTo(365 / 12, 9);
    expect(result.schedule[0].interest).toBe(0);
    expect(result.schedule[0].principal).toBeCloseTo(result.calculatedPayment, 5);
    // Annuity-due payment = ordinary payment / (1 + r)
    expect(result.calculatedPayment).toBeCloseTo(annuityPayment(120000, 0.01, 12) / 1.01, 2);
    expect(result.schedule[1].interest).toBeCloseTo(result.schedule[0].balance * 0.01, 6);
    expect(result.schedule[11].balance).toBeCloseTo(0, 5);
    expect(result.summary.totalInterest).toBeLessThan(ordinary.summary.totalInterest);
  });

  it("in a set number of days: the first installment carries a partial period", () => {
    const periodDays = 365 / 12;
    const result = buildSchedule(
      input({ ...base, interestStart: "days", interestStartDays: 10 })
    );
    expect(result.interestBeginsDay).toBe(10);
    expect(result.schedule[0].interest).toBeCloseTo(120000 * 0.01 * (1 - 10 / periodDays), 6);
    expect(result.schedule[1].interest).toBeCloseTo(result.schedule[0].balance * 0.01, 6);
    expect(result.schedule[11].balance).toBeCloseTo(0, 5);
    expect(result.calculatedPayment).toBeLessThan(ordinary.calculatedPayment);
    expect(result.calculatedPayment).toBeGreaterThan(annuityPayment(120000, 0.01, 12) / 1.01);
  });

  it("in zero days is the same as the agreement date", () => {
    const result = buildSchedule(input({ ...base, interestStart: "days", interestStartDays: 0 }));
    expect(result.calculatedPayment).toBe(ordinary.calculatedPayment);
    expect(result.summary.totalInterest).toBeCloseTo(ordinary.summary.totalInterest, 6);
  });

  it("after a later installment: earlier installments are interest-free", () => {
    // Interest begins on day 61 — during month 3 (days 60.8–91.25).
    const periodDays = 365 / 12;
    const result = buildSchedule(input({ ...base, interestStart: "days", interestStartDays: 61 }));
    expect(result.schedule[0].interest).toBe(0);
    expect(result.schedule[1].interest).toBe(0);
    expect(result.schedule[2].interest).toBeCloseTo(
      result.schedule[1].balance * 0.01 * (3 - 61 / periodDays),
      6
    );
    expect(result.schedule[11].balance).toBeCloseTo(0, 5);
  });

  it("after the final payment: no interest, and a warning says so", () => {
    const result = buildSchedule(input({ ...base, interestStart: "days", interestStartDays: 400 }));
    expect(result.summary.totalInterest).toBe(0);
    expect(result.calculatedPayment).toBeCloseTo(10000, 5);
    expect(result.warnings.some((w) => w.includes("no interest accrues"))).toBe(true);
  });

  it("delays the interest clock in amount mode too", () => {
    const withInterest = buildSchedule(
      input({
        totalSettlement: 100000,
        installmentMode: "amount",
        installmentAmount: 10000,
        interestScope: "installments",
        annualRate: 12,
      })
    );
    const dueStyle = buildSchedule(
      input({
        totalSettlement: 100000,
        installmentMode: "amount",
        installmentAmount: 10000,
        interestScope: "installments",
        annualRate: 12,
        interestStart: "first-installment",
      })
    );
    expect(dueStyle.schedule[0].interest).toBe(0);
    expect(dueStyle.summary.totalInterest).toBeLessThan(withInterest.summary.totalInterest);
    expect(dueStyle.calculatedCount).toBeLessThanOrEqual(withInterest.calculatedCount);
  });

  it("does not affect a 0% schedule", () => {
    const result = buildSchedule(
      input({ totalSettlement: 120000, numPayments: 12, interestStart: "first-installment" })
    );
    expect(result.interestBeginsDay).toBeNull();
    expect(result.calculatedPayment).toBeCloseTo(10000, 5);
    expect(result.warnings).toHaveLength(0);
  });
});

describe("buildSchedule — worked example from lib/tool-content.ts", () => {
  const base = {
    totalSettlement: 120000,
    upfronts: [{ amount: 20000, days: 0 }],
    numPayments: 12,
    interestScope: "installments" as const,
    annualRate: 6,
  };

  it("interest from the agreement date", () => {
    const result = buildSchedule(input(base));
    expect(result.calculatedPayment).toBe(8606.64);
    expect(result.summary.totalInterest).toBeCloseTo(3279.72, 1);
    expect(result.summary.totalPaid).toBeCloseTo(123279.72, 1);
  });

  it("interest from the first installment", () => {
    const result = buildSchedule(input({ ...base, interestStart: "first-installment" }));
    expect(result.calculatedPayment).toBe(8563.82);
    expect(result.summary.totalInterest).toBeCloseTo(2765.89, 1);
    expect(result.summary.totalPaid).toBeCloseTo(122765.89, 1);
  });

  it("at 0%", () => {
    const result = buildSchedule(input({ ...base, interestScope: "none" }));
    expect(result.calculatedPayment).toBe(8333.33);
  });
});

describe("buildSchedule — custom frequency without an interval", () => {
  it("warns and returns no schedule instead of silently using monthly math", () => {
    const result = buildSchedule(
      input({
        totalSettlement: 100000,
        numPayments: 6,
        frequency: "custom",
        customIntervalDays: 0,
        interestScope: "installments",
      })
    );
    expect(result.schedule).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes("interval"))).toBe(true);
  });
});

describe("buildSchedule — installment cap", () => {
  it("caps an absurd payment count and warns", () => {
    const result = buildSchedule(
      input({ totalSettlement: 120000, numPayments: 99999999 })
    );
    expect(result.schedule).toHaveLength(1200);
    expect(result.warnings.some((w) => w.includes("capped"))).toBe(true);
    // The capped schedule still amortizes fully
    expect(result.schedule[1199].balance).toBeCloseTo(0, 5);
  });

  it("caps amount mode when a tiny payment would run long, and warns", () => {
    // 120,000 at $1/payment would need 120,000 rows
    const result = buildSchedule(
      input({
        totalSettlement: 120000,
        installmentMode: "amount",
        installmentAmount: 1,
      })
    );
    expect(result.schedule).toHaveLength(1200);
    expect(result.calculatedCount).toBe(1200);
    expect(result.warnings.some((w) => w.includes("balance will remain"))).toBe(true);
  });

  it("does not balloon the final row of a capped amount-mode schedule", () => {
    // The warning says "a balance will remain" — so row 1,200 must be a
    // normal payment with a balance actually remaining, not a balloon payoff.
    const result = buildSchedule(
      input({
        totalSettlement: 120000,
        installmentMode: "amount",
        installmentAmount: 1,
      })
    );
    const last = result.schedule[result.schedule.length - 1];
    expect(last.payment).toBe(1);
    expect(last.balance).toBeGreaterThan(0);
    expect(result.summary.totalPaid).toBeCloseTo(1200, 5);

    // Same with interest in play
    const withInterest = buildSchedule(
      input({
        totalSettlement: 100000,
        installmentMode: "amount",
        installmentAmount: 500.01,
        interestScope: "installments",
        annualRate: 6,
      })
    );
    const lastWI = withInterest.schedule[withInterest.schedule.length - 1];
    expect(lastWI.payment).toBeCloseTo(500.01, 5);
    expect(lastWI.balance).toBeGreaterThan(0);
  });
});

describe("buildSchedule — quarterly and custom frequencies", () => {
  it("uses 4 periods per year for quarterly", () => {
    const result = buildSchedule(
      input({
        totalSettlement: 100000,
        numPayments: 4,
        frequency: "quarterly",
        interestScope: "installments",
        annualRate: 8,
      })
    );
    const r = 0.02; // 8% / 4
    expect(result.calculatedPayment).toBeCloseTo(annuityPayment(100000, r, 4), 2);
    expect(result.schedule[0].label).toBe("Quarter 1");
    expect(result.periodDays).toBeCloseTo(365 / 4, 9);
  });

  it("derives the period rate from custom interval days", () => {
    const result = buildSchedule(
      input({
        totalSettlement: 100000,
        numPayments: 4,
        frequency: "custom",
        customIntervalDays: 73, // 5 periods per year
        interestScope: "installments",
        annualRate: 10,
      })
    );
    const r = 0.1 / (365 / 73); // 2% per period
    expect(result.calculatedPayment).toBeCloseTo(annuityPayment(100000, r, 4), 2);
    expect(result.schedule[0].label).toBe("Payment 1");
    expect(result.periodDays).toBe(73);
  });
});
