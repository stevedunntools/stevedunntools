import {
  Bracket,
  FilingStatus,
  STATES,
  FEDERAL_BRACKETS,
  FEDERAL_STANDARD_DEDUCTION,
  SS_WAGE_BASE_2026,
  SS_EMPLOYEE_RATE,
  SS_SE_RATE,
  MEDICARE_EMPLOYEE_RATE,
  MEDICARE_SE_RATE,
  ADDITIONAL_MEDICARE_RATE,
  ADDITIONAL_MEDICARE_THRESHOLD,
  SE_NET_EARNINGS_FACTOR,
  SE_DEDUCTIBLE_FRACTION,
  QBI_RATE,
  QBI_THRESHOLD,
} from "./tax-data";

export type Income1099Type = "se" | "other";

export interface CalcInput {
  filingStatus: FilingStatus;
  stateCode: string;
  w2Wages: number;
  income1099: number;
  income1099Type: Income1099Type;
  piIncome: number;
}

export interface CategoryResult {
  label: string;
  gross: number;
  federalIncomeTax: number;
  fica: number;          // SS + Medicare (employee portion) for W-2
  seTax: number;         // self-employment tax for 1099-SE
  stateIncomeTax: number;
  statePayrollTax: number;
  totalTax: number;
  net: number;
}

export interface CalcResult {
  categories: CategoryResult[];
  totals: {
    gross: number;
    federalIncomeTax: number;
    fica: number;
    seTax: number;
    stateIncomeTax: number;
    statePayrollTax: number;
    totalTax: number;
    net: number;
  };
  notes: {
    effectiveRate: number;
    federalTaxableIncome: number;
    qbiDeduction: number;
    halfSeDeduction: number;
    statePayrollBreakdown: { name: string; amount: number }[];
  };
}

/** Walk through bracket schedule and compute tax on taxable income. */
export function taxFromBrackets(taxableIncome: number, brackets: Bracket[]): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const lower = brackets[i].from;
    if (taxableIncome <= lower) break;
    const upper = i + 1 < brackets.length ? brackets[i + 1].from : Infinity;
    const slice = Math.min(taxableIncome, upper) - lower;
    tax += slice * brackets[i].rate;
  }
  return tax;
}

export function calculate(input: CalcInput): CalcResult {
  const { filingStatus, stateCode, w2Wages, income1099, income1099Type, piIncome } = input;
  const state = STATES.find((s) => s.code === stateCode);
  if (!state) throw new Error(`Unknown state: ${stateCode}`);

  // -----------------------------------------------------------------------
  // FICA on W-2 wages (employee portion)
  // -----------------------------------------------------------------------
  const ssTaxedWages = Math.min(w2Wages, SS_WAGE_BASE_2026);
  const ssOnWages = ssTaxedWages * SS_EMPLOYEE_RATE;
  const medicareOnWages = w2Wages * MEDICARE_EMPLOYEE_RATE;

  // -----------------------------------------------------------------------
  // Self-employment tax (only for SE-type 1099 income)
  // -----------------------------------------------------------------------
  let seTax = 0;
  let halfSeDeduction = 0;
  let seNetEarnings = 0;
  let seSsPortion = 0;
  let seMedicarePortion = 0;
  if (income1099Type === "se" && income1099 > 0) {
    seNetEarnings = income1099 * SE_NET_EARNINGS_FACTOR;
    // SS portion of SE tax — wage base is shared with W-2 SS-taxed wages
    const ssRemainingBase = Math.max(0, SS_WAGE_BASE_2026 - ssTaxedWages);
    const seSsTaxable = Math.min(seNetEarnings, ssRemainingBase);
    seSsPortion = seSsTaxable * SS_SE_RATE;
    seMedicarePortion = seNetEarnings * MEDICARE_SE_RATE;
    seTax = seSsPortion + seMedicarePortion;
    halfSeDeduction = seTax * SE_DEDUCTIBLE_FRACTION;
  }

  // -----------------------------------------------------------------------
  // Additional Medicare Tax (0.9% on combined W-2 + SE earnings above threshold)
  // Applies to both wage earners and self-employed; not deductible.
  // -----------------------------------------------------------------------
  const addlMedicareBase = w2Wages + seNetEarnings;
  const addlMedicareThreshold = ADDITIONAL_MEDICARE_THRESHOLD[filingStatus];
  const addlMedicareTaxable = Math.max(0, addlMedicareBase - addlMedicareThreshold);
  const addlMedicareTax = addlMedicareTaxable * ADDITIONAL_MEDICARE_RATE;
  // Apportion additional Medicare between W-2 and SE based on contribution
  let addlMedicareOnWages = 0;
  let addlMedicareOnSE = 0;
  if (addlMedicareTax > 0 && addlMedicareBase > 0) {
    addlMedicareOnWages = addlMedicareTax * (w2Wages / addlMedicareBase);
    addlMedicareOnSE = addlMedicareTax * (seNetEarnings / addlMedicareBase);
  }

  const ficaOnWages = ssOnWages + medicareOnWages + addlMedicareOnWages;
  const seTaxTotal = seTax + addlMedicareOnSE;

  // -----------------------------------------------------------------------
  // Federal income tax (on combined W-2 + 1099, less half-SE and QBI)
  // -----------------------------------------------------------------------
  const grossOrdinaryIncome = w2Wages + income1099; // PI excluded
  const federalAGI = Math.max(0, grossOrdinaryIncome - halfSeDeduction);
  const taxableBeforeQBI = Math.max(0, federalAGI - FEDERAL_STANDARD_DEDUCTION[filingStatus]);

  // QBI deduction — simplified: 20% of (1099 SE income - half-SE attributable to it),
  // capped at 20% of taxable income before QBI. No SSTB/W-2 wage limitations applied.
  let qbiDeduction = 0;
  if (income1099Type === "se" && income1099 > 0) {
    const qbi = Math.max(0, income1099 - halfSeDeduction);
    qbiDeduction = Math.min(QBI_RATE * qbi, QBI_RATE * taxableBeforeQBI);
    // Phaseout: above the QBI threshold, treat as 0 (worst case — many SSTBs lose the deduction entirely)
    if (taxableBeforeQBI > QBI_THRESHOLD[filingStatus]) {
      qbiDeduction = 0;
    }
  }

  const federalTaxableIncome = Math.max(0, taxableBeforeQBI - qbiDeduction);
  const federalIncomeTax = taxFromBrackets(federalTaxableIncome, FEDERAL_BRACKETS[filingStatus]);

  // -----------------------------------------------------------------------
  // State income tax
  // -----------------------------------------------------------------------
  let stateIncomeTax = 0;
  if (state.hasIncomeTax && state.brackets && state.baseDeduction) {
    // States generally don't allow the half-SE deduction; use gross ordinary income
    const stateAGI = grossOrdinaryIncome;
    const statusKey: "single" | "mfj" =
      filingStatus === "mfj" ? "mfj" : "single";
    const stateTaxable = Math.max(0, stateAGI - state.baseDeduction[statusKey]);
    stateIncomeTax = taxFromBrackets(stateTaxable, state.brackets[statusKey]);
  }

  // -----------------------------------------------------------------------
  // State payroll taxes (apply only to W-2 wages)
  // -----------------------------------------------------------------------
  const statePayrollBreakdown: { name: string; amount: number }[] = [];
  let statePayrollTotal = 0;
  if (state.payrollTaxes && w2Wages > 0) {
    for (const program of state.payrollTaxes) {
      const base = program.wageBase == null ? w2Wages : Math.min(w2Wages, program.wageBase);
      let amount = base * program.rate;
      if (program.annualCap != null) amount = Math.min(amount, program.annualCap);
      statePayrollBreakdown.push({ name: program.name, amount });
      statePayrollTotal += amount;
    }
  }

  // -----------------------------------------------------------------------
  // Allocate federal & state income tax proportionally between W-2 and 1099
  // (PI gets none). For W-2-only or 1099-only inputs, the math is degenerate.
  // -----------------------------------------------------------------------
  const w2Share = grossOrdinaryIncome > 0 ? w2Wages / grossOrdinaryIncome : 0;
  const inc1099Share = grossOrdinaryIncome > 0 ? income1099 / grossOrdinaryIncome : 0;

  const w2FedTax = federalIncomeTax * w2Share;
  const inc1099FedTax = federalIncomeTax * inc1099Share;
  const w2StateTax = stateIncomeTax * w2Share;
  const inc1099StateTax = stateIncomeTax * inc1099Share;

  const categories: CategoryResult[] = [];

  if (w2Wages > 0) {
    const totalTax = w2FedTax + ficaOnWages + w2StateTax + statePayrollTotal;
    categories.push({
      label: "W-2 wages",
      gross: w2Wages,
      federalIncomeTax: w2FedTax,
      fica: ficaOnWages,
      seTax: 0,
      stateIncomeTax: w2StateTax,
      statePayrollTax: statePayrollTotal,
      totalTax,
      net: w2Wages - totalTax,
    });
  }

  if (income1099 > 0) {
    const seTaxForCategory = income1099Type === "se" ? seTaxTotal : 0;
    const totalTax = inc1099FedTax + seTaxForCategory + inc1099StateTax;
    categories.push({
      label: income1099Type === "se" ? "1099 income (self-employment)" : "1099 income (non-SE)",
      gross: income1099,
      federalIncomeTax: inc1099FedTax,
      fica: 0,
      seTax: seTaxForCategory,
      stateIncomeTax: inc1099StateTax,
      statePayrollTax: 0,
      totalTax,
      net: income1099 - totalTax,
    });
  }

  if (piIncome > 0) {
    categories.push({
      label: "Personal injury (tax-free)",
      gross: piIncome,
      federalIncomeTax: 0,
      fica: 0,
      seTax: 0,
      stateIncomeTax: 0,
      statePayrollTax: 0,
      totalTax: 0,
      net: piIncome,
    });
  }

  const totals = categories.reduce(
    (acc, c) => ({
      gross: acc.gross + c.gross,
      federalIncomeTax: acc.federalIncomeTax + c.federalIncomeTax,
      fica: acc.fica + c.fica,
      seTax: acc.seTax + c.seTax,
      stateIncomeTax: acc.stateIncomeTax + c.stateIncomeTax,
      statePayrollTax: acc.statePayrollTax + c.statePayrollTax,
      totalTax: acc.totalTax + c.totalTax,
      net: acc.net + c.net,
    }),
    {
      gross: 0, federalIncomeTax: 0, fica: 0, seTax: 0,
      stateIncomeTax: 0, statePayrollTax: 0, totalTax: 0, net: 0,
    }
  );

  return {
    categories,
    totals,
    notes: {
      effectiveRate: totals.gross > 0 ? totals.totalTax / totals.gross : 0,
      federalTaxableIncome,
      qbiDeduction,
      halfSeDeduction,
      statePayrollBreakdown,
    },
  };
}
