import { describe, it, expect } from "vitest";
import { calculate, taxFromBrackets } from "./calculate";
import {
  FEDERAL_STANDARD_DEDUCTION,
  SS_WAGE_BASE_2026,
  SS_EMPLOYEE_RATE,
  MEDICARE_EMPLOYEE_RATE,
  Bracket,
} from "./tax-data";

describe("taxFromBrackets", () => {
  const brackets: Bracket[] = [
    { from: 0, rate: 0.1 },
    { from: 10000, rate: 0.2 },
    { from: 50000, rate: 0.3 },
  ];

  it("returns 0 for non-positive income", () => {
    expect(taxFromBrackets(0, brackets)).toBe(0);
    expect(taxFromBrackets(-5000, brackets)).toBe(0);
  });

  it("taxes only the first bracket for low income", () => {
    expect(taxFromBrackets(8000, brackets)).toBeCloseTo(800, 5);
  });

  it("applies marginal rates across brackets", () => {
    // 10%×10,000 + 20%×40,000 + 30%×10,000 = 1,000 + 8,000 + 3,000
    expect(taxFromBrackets(60000, brackets)).toBeCloseTo(12000, 5);
  });
});

describe("calculate — W-2 only, no-income-tax state", () => {
  const result = calculate({
    filingStatus: "single",
    stateCode: "TX",
    w2Wages: 100000,
    income1099: 0,
    income1099Type: "se",
    piIncome: 0,
  });

  it("computes 2026 federal income tax on wages less the standard deduction", () => {
    // Taxable: 100,000 - 16,100 = 83,900
    // 10%×12,400 + 12%×38,000 + 22%×33,500 = 1,240 + 4,560 + 7,370
    expect(result.totals.federalIncomeTax).toBeCloseTo(13170, 0);
  });

  it("computes employee FICA", () => {
    expect(result.totals.fica).toBeCloseTo(100000 * 0.062 + 100000 * 0.0145, 2);
  });

  it("charges no state tax in Texas", () => {
    expect(result.totals.stateIncomeTax).toBe(0);
    expect(result.totals.statePayrollTax).toBe(0);
  });

  it("nets out gross minus taxes", () => {
    expect(result.totals.net).toBeCloseTo(
      result.totals.gross - result.totals.totalTax,
      5
    );
  });
});

describe("calculate — Social Security wage base cap", () => {
  const result = calculate({
    filingStatus: "single",
    stateCode: "TX",
    w2Wages: 250000,
    income1099: 0,
    income1099Type: "se",
    piIncome: 0,
  });

  it("caps Social Security at the wage base and adds Additional Medicare above $200k", () => {
    const ss = SS_WAGE_BASE_2026 * SS_EMPLOYEE_RATE;
    const medicare = 250000 * MEDICARE_EMPLOYEE_RATE;
    const addlMedicare = (250000 - 200000) * 0.009;
    expect(result.totals.fica).toBeCloseTo(ss + medicare + addlMedicare, 2);
  });
});

describe("calculate — self-employment income", () => {
  const result = calculate({
    filingStatus: "single",
    stateCode: "TX",
    w2Wages: 0,
    income1099: 50000,
    income1099Type: "se",
    piIncome: 0,
  });

  it("computes SE tax on 92.35% of net earnings", () => {
    const netEarnings = 50000 * 0.9235;
    const seTax = netEarnings * 0.124 + netEarnings * 0.029;
    expect(result.totals.seTax).toBeCloseTo(seTax, 2);
  });

  it("deducts half of SE tax above the line", () => {
    expect(result.notes.halfSeDeduction).toBeCloseTo(result.totals.seTax / 2, 2);
  });

  it("applies the QBI deduction capped at 20% of taxable income", () => {
    const halfSe = result.notes.halfSeDeduction;
    const taxableBeforeQBI = 50000 - halfSe - FEDERAL_STANDARD_DEDUCTION.single;
    expect(result.notes.qbiDeduction).toBeCloseTo(
      Math.min(0.2 * (50000 - halfSe), 0.2 * taxableBeforeQBI),
      2
    );
  });

  it("charges no employee FICA on 1099 income", () => {
    expect(result.totals.fica).toBe(0);
  });
});

describe("calculate — non-SE 1099 income", () => {
  it("charges no SE tax", () => {
    const result = calculate({
      filingStatus: "single",
      stateCode: "TX",
      w2Wages: 0,
      income1099: 50000,
      income1099Type: "other",
      piIncome: 0,
    });
    expect(result.totals.seTax).toBe(0);
    expect(result.notes.qbiDeduction).toBe(0);
  });
});

describe("calculate — personal injury proceeds", () => {
  it("treats PI income as fully tax-free", () => {
    const result = calculate({
      filingStatus: "single",
      stateCode: "NC",
      w2Wages: 0,
      income1099: 0,
      income1099Type: "se",
      piIncome: 500000,
    });
    expect(result.totals.totalTax).toBe(0);
    expect(result.totals.net).toBe(500000);
  });
});

describe("calculate — state income tax", () => {
  it("charges North Carolina income tax on wages", () => {
    const result = calculate({
      filingStatus: "single",
      stateCode: "NC",
      w2Wages: 100000,
      income1099: 0,
      income1099Type: "se",
      piIncome: 0,
    });
    expect(result.totals.stateIncomeTax).toBeGreaterThan(0);
  });

  it("throws on an unknown state code", () => {
    expect(() =>
      calculate({
        filingStatus: "single",
        stateCode: "ZZ",
        w2Wages: 100000,
        income1099: 0,
        income1099Type: "se",
        piIncome: 0,
      })
    ).toThrow();
  });
});
