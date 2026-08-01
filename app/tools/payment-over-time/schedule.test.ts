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
    ...overrides,
  };
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
  });
});

describe("buildSchedule — up-front payments", () => {
  it("applies upfronts at T=0 before installments", () => {
    const result = buildSchedule(
      input({
        totalSettlement: 100000,
        upfronts: [{ amount: 25000, timing: "At signing" }],
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
        upfronts: [{ amount: 60000, timing: "At signing" }],
        numPayments: 6,
      })
    );
    expect(result.warnings).toHaveLength(1);
    expect(result.schedule).toHaveLength(1);
    expect(result.schedule[0].payment).toBe(50000);
    expect(result.schedule[0].balance).toBe(0);
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
    const r = 0.01;
    const expected = (120000 * r) / (1 - Math.pow(1 + r, -12));
    expect(result.calculatedPayment).toBeCloseTo(expected, 2);
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

describe("buildSchedule — installment cap", () => {  it("caps an absurd payment count and warns", () => {
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
    const expected = (100000 * r) / (1 - Math.pow(1 + r, -4));
    expect(result.calculatedPayment).toBeCloseTo(expected, 2);
    expect(result.schedule[0].label).toBe("Quarter 1");
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
    const expected = (100000 * r) / (1 - Math.pow(1 + r, -4));
    expect(result.calculatedPayment).toBeCloseTo(expected, 2);
    expect(result.schedule[0].label).toBe("Payment 1");
  });
});
