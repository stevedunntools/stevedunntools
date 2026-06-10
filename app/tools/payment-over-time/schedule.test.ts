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
    interestStart: "first-installment",
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

describe("buildSchedule — interest starting immediately", () => {
  it("accrues one period of interest on the post-upfront balance", () => {
    const result = buildSchedule(
      input({
        totalSettlement: 100000,
        upfronts: [{ amount: 40000, timing: "At signing" }],
        numPayments: 6,
        interestScope: "installments",
        interestStart: "immediately",
        annualRate: 12,
      })
    );
    const accrued = result.schedule.find((r) => r.label === "Accrued interest");
    expect(accrued).toBeDefined();
    expect(accrued!.interest).toBeCloseTo(60000 * 0.01, 5);
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
