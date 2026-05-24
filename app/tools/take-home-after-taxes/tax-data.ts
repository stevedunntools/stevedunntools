// Tax data for the take-home-after-taxes calculator.
// All figures are for tax year 2026 unless otherwise noted.
//
// Sources cited per-section. This is a simplified model — see DISCLAIMER for
// limitations.

export type FilingStatus = "single" | "mfj" | "mfs" | "hoh";

export interface Bracket {
  /** The income threshold at which this marginal rate begins. */
  from: number;
  /** Marginal rate (e.g. 0.22 for 22%). */
  rate: number;
}

export interface PayrollTaxProgram {
  /** Display name e.g. "SDI", "PFL". */
  name: string;
  /** Employee contribution rate (e.g. 0.013 for 1.3%). */
  rate: number;
  /** Wage base above which the tax stops applying. null = no cap. */
  wageBase: number | null;
  /** Hard annual contribution cap, if any (e.g. NY SDI is capped at $31.20/yr). */
  annualCap?: number;
}

export interface StateConfig {
  code: string;
  name: string;
  hasIncomeTax: boolean;
  /** Bracket schedule by filing status. If hasIncomeTax is false, this is undefined. */
  brackets?: { single: Bracket[]; mfj: Bracket[] };
  /**
   * Base deduction applied to gross income before applying brackets.
   * Combines state standard deduction + personal exemption (where applicable).
   * Personal exemption *credits* (vs. deductions) are ignored for simplicity.
   */
  baseDeduction?: { single: number; mfj: number };
  /** Employee-side state payroll programs (SDI, PFL, etc.). */
  payrollTaxes?: PayrollTaxProgram[];
}

// ---------------------------------------------------------------------------
// FEDERAL — tax year 2026
// Sources:
//   Brackets, standard deduction, QBI thresholds:
//     IRS Rev. Proc. 2025-32 / IRS news release (Oct 2025)
//     https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill
//     https://taxfoundation.org/data/all/federal/2026-tax-brackets/
//   Social Security wage base: SSA fact sheet (Oct 24, 2025)
//     https://www.ssa.gov/news/en/cola/factsheets/2026.html
//     2026 wage base: $184,500; employee rate 6.2%
//   Additional Medicare Tax thresholds: IRC §1401(b)(2)/§3101(b)(2) — not
//     inflation-adjusted, set permanently at $200,000 / $250,000 / $125,000.
//   Self-employment tax: IRC §1401 — 12.4% SS + 2.9% Medicare on 92.35% of
//     net SE earnings; half deductible above-the-line per §164(f).
// ---------------------------------------------------------------------------

export const FEDERAL_BRACKETS: Record<FilingStatus, Bracket[]> = {
  single: [
    { from: 0, rate: 0.10 },
    { from: 12400, rate: 0.12 },
    { from: 50400, rate: 0.22 },
    { from: 105700, rate: 0.24 },
    { from: 201775, rate: 0.32 },
    { from: 256225, rate: 0.35 },
    { from: 640600, rate: 0.37 },
  ],
  mfj: [
    { from: 0, rate: 0.10 },
    { from: 24800, rate: 0.12 },
    { from: 100800, rate: 0.22 },
    { from: 211400, rate: 0.24 },
    { from: 403550, rate: 0.32 },
    { from: 512450, rate: 0.35 },
    { from: 768700, rate: 0.37 },
  ],
  // MFS thresholds are exactly half of MFJ.
  mfs: [
    { from: 0, rate: 0.10 },
    { from: 12400, rate: 0.12 },
    { from: 50400, rate: 0.22 },
    { from: 105700, rate: 0.24 },
    { from: 201775, rate: 0.32 },
    { from: 256225, rate: 0.35 },
    { from: 384350, rate: 0.37 },
  ],
  hoh: [
    { from: 0, rate: 0.10 },
    { from: 17700, rate: 0.12 },
    { from: 67450, rate: 0.22 },
    { from: 105700, rate: 0.24 },
    { from: 201775, rate: 0.32 },
    { from: 256200, rate: 0.35 },
    { from: 640600, rate: 0.37 },
  ],
};

export const FEDERAL_STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 16100,
  mfj: 32200,
  mfs: 16100,
  hoh: 24150,
};

// Social Security (OASDI)
export const SS_WAGE_BASE_2026 = 184500;
export const SS_EMPLOYEE_RATE = 0.062;
export const SS_SE_RATE = 0.124;

// Medicare
export const MEDICARE_EMPLOYEE_RATE = 0.0145;
export const MEDICARE_SE_RATE = 0.029;
export const ADDITIONAL_MEDICARE_RATE = 0.009;
export const ADDITIONAL_MEDICARE_THRESHOLD: Record<FilingStatus, number> = {
  single: 200000,
  mfj: 250000,
  mfs: 125000,
  hoh: 200000,
};

// Self-employment tax
export const SE_NET_EARNINGS_FACTOR = 0.9235; // §1402(a)
export const SE_DEDUCTIBLE_FRACTION = 0.5;    // §164(f)

// QBI / Section 199A (simplified — no SSTB or W-2 wage limitations applied)
export const QBI_RATE = 0.20;
export const QBI_THRESHOLD: Record<FilingStatus, number> = {
  single: 201775,
  mfj: 403500,
  mfs: 201750,
  hoh: 201775,
};

// ---------------------------------------------------------------------------
// STATES — tax year 2026
// Primary source: Tax Foundation, "2026 State Income Tax Rates and Brackets"
//   https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/
// State payroll programs cited inline.
//
// Modeling notes:
//   - MFS defaults to Single brackets/deduction at the state level (matches
//     most state conventions; states that require joint-with-halved-thresholds
//     are not separately modeled).
//   - HOH defaults to Single brackets/deduction (most states do not have
//     separate HOH schedules).
//   - "baseDeduction" combines state standard deduction + dollar personal
//     exemption. Personal exemption *credits* (e.g., CA, AR, OR) are not
//     applied to reduce tax — they're small and create more noise than signal.
//   - Washington's 7% capital gains tax does not apply to wage income, so WA
//     is treated as having no income tax for this calculator's purposes.
//   - Personal injury damages excluded under IRC §104(a)(2) — all states are
//     assumed to conform (true in practice for the physical-injury exclusion).
// ---------------------------------------------------------------------------

export const STATES: StateConfig[] = [
  { code: "AL", name: "Alabama", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.02 }, { from: 500, rate: 0.04 }, { from: 3000, rate: 0.05 }],
      mfj:    [{ from: 0, rate: 0.02 }, { from: 1000, rate: 0.04 }, { from: 6000, rate: 0.05 }],
    },
    baseDeduction: { single: 4500, mfj: 11500 }, // $3,000 std + $1,500 pers exempt / $8,500 + $3,000
  },
  { code: "AK", name: "Alaska", hasIncomeTax: false },
  { code: "AZ", name: "Arizona", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.025 }],
      mfj:    [{ from: 0, rate: 0.025 }],
    },
    baseDeduction: { single: 8350, mfj: 16700 },
  },
  { code: "AR", name: "Arkansas", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.02 }, { from: 4600, rate: 0.039 }],
      mfj:    [{ from: 0, rate: 0.02 }, { from: 4600, rate: 0.039 }],
    },
    baseDeduction: { single: 2470, mfj: 4940 },
  },
  { code: "CA", name: "California", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.01 },
        { from: 11079, rate: 0.02 },
        { from: 26264, rate: 0.04 },
        { from: 41452, rate: 0.06 },
        { from: 57542, rate: 0.08 },
        { from: 72724, rate: 0.093 },
        { from: 371479, rate: 0.103 },
        { from: 445771, rate: 0.113 },
        { from: 742953, rate: 0.123 },
        { from: 1000000, rate: 0.133 },
      ],
      mfj: [
        { from: 0, rate: 0.01 },
        { from: 22158, rate: 0.02 },
        { from: 52528, rate: 0.04 },
        { from: 82904, rate: 0.06 },
        { from: 115084, rate: 0.08 },
        { from: 145448, rate: 0.093 },
        { from: 742958, rate: 0.103 },
        { from: 891542, rate: 0.113 },
        { from: 1485906, rate: 0.123 },
        { from: 2000000, rate: 0.133 },
      ],
    },
    baseDeduction: { single: 5540, mfj: 11080 },
    // CA SDI: 1.3% of all wages (no cap) effective 1/1/2026
    // https://edd.ca.gov/en/payroll_taxes/rates_and_withholding/
    payrollTaxes: [
      { name: "SDI", rate: 0.013, wageBase: null },
    ],
  },
  { code: "CO", name: "Colorado", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.044 }],
      mfj:    [{ from: 0, rate: 0.044 }],
    },
    baseDeduction: { single: 16100, mfj: 32200 }, // ties to federal std ded
    // CO FAMLI: 0.45% employee share (of 0.9% total premium), capped at SS wage base
    // https://famli.colorado.gov/employers
    payrollTaxes: [
      { name: "FAMLI", rate: 0.0045, wageBase: SS_WAGE_BASE_2026 },
    ],
  },
  { code: "CT", name: "Connecticut", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.02 },
        { from: 10000, rate: 0.045 },
        { from: 50000, rate: 0.055 },
        { from: 100000, rate: 0.06 },
        { from: 200000, rate: 0.065 },
        { from: 250000, rate: 0.069 },
        { from: 500000, rate: 0.0699 },
      ],
      mfj: [
        { from: 0, rate: 0.02 },
        { from: 20000, rate: 0.045 },
        { from: 100000, rate: 0.055 },
        { from: 200000, rate: 0.06 },
        { from: 400000, rate: 0.065 },
        { from: 500000, rate: 0.069 },
        { from: 1000000, rate: 0.0699 },
      ],
    },
    baseDeduction: { single: 15000, mfj: 24000 }, // personal exemption (no std ded); CT phaseouts ignored
    // CT Paid Leave (CTPL): 0.5% capped at SS wage base
    // https://ctpaidleave.org/s/employer-faq
    payrollTaxes: [
      { name: "Paid Leave", rate: 0.005, wageBase: SS_WAGE_BASE_2026 },
    ],
  },
  { code: "DE", name: "Delaware", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 2000, rate: 0.022 },
        { from: 5000, rate: 0.039 },
        { from: 10000, rate: 0.048 },
        { from: 20000, rate: 0.052 },
        { from: 25000, rate: 0.0555 },
        { from: 60000, rate: 0.066 },
      ],
      mfj: [
        { from: 2000, rate: 0.022 },
        { from: 5000, rate: 0.039 },
        { from: 10000, rate: 0.048 },
        { from: 20000, rate: 0.052 },
        { from: 25000, rate: 0.0555 },
        { from: 60000, rate: 0.066 },
      ],
    },
    baseDeduction: { single: 3250, mfj: 6500 },
  },
  { code: "FL", name: "Florida", hasIncomeTax: false },
  { code: "GA", name: "Georgia", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.0519 }],
      mfj:    [{ from: 0, rate: 0.0519 }],
    },
    baseDeduction: { single: 12000, mfj: 24000 },
  },
  { code: "HI", name: "Hawaii", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.014 }, { from: 9600, rate: 0.032 },
        { from: 14400, rate: 0.055 }, { from: 19200, rate: 0.064 },
        { from: 24000, rate: 0.068 }, { from: 36000, rate: 0.072 },
        { from: 48000, rate: 0.076 }, { from: 125000, rate: 0.079 },
        { from: 175000, rate: 0.0825 }, { from: 225000, rate: 0.09 },
        { from: 275000, rate: 0.10 }, { from: 325000, rate: 0.11 },
      ],
      mfj: [
        { from: 0, rate: 0.014 }, { from: 19200, rate: 0.032 },
        { from: 28800, rate: 0.055 }, { from: 38400, rate: 0.064 },
        { from: 48000, rate: 0.068 }, { from: 72000, rate: 0.072 },
        { from: 96000, rate: 0.076 }, { from: 250000, rate: 0.079 },
        { from: 350000, rate: 0.0825 }, { from: 450000, rate: 0.09 },
        { from: 550000, rate: 0.10 }, { from: 650000, rate: 0.11 },
      ],
    },
    baseDeduction: { single: 5544, mfj: 11088 }, // $4,400 std + $1,144 pers exempt
    // HI TDI: 0.5% of weekly wages, capped at $1,500.21/week (~$78,011/yr)
    // https://labor.hawaii.gov/dcd/home/about-tdi/
    payrollTaxes: [
      { name: "TDI", rate: 0.005, wageBase: 78011 },
    ],
  },
  { code: "ID", name: "Idaho", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.053 }],
      mfj:    [{ from: 0, rate: 0.053 }],
    },
    baseDeduction: { single: 16100, mfj: 32200 },
  },
  { code: "IL", name: "Illinois", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.0495 }],
      mfj:    [{ from: 0, rate: 0.0495 }],
    },
    baseDeduction: { single: 2925, mfj: 5850 },
  },
  { code: "IN", name: "Indiana", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.0295 }],
      mfj:    [{ from: 0, rate: 0.0295 }],
    },
    baseDeduction: { single: 1000, mfj: 2000 },
  },
  { code: "IA", name: "Iowa", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.038 }],
      mfj:    [{ from: 0, rate: 0.038 }],
    },
    baseDeduction: { single: 16100, mfj: 32200 },
  },
  { code: "KS", name: "Kansas", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.052 }, { from: 23000, rate: 0.0558 }],
      mfj:    [{ from: 0, rate: 0.052 }, { from: 46000, rate: 0.0558 }],
    },
    baseDeduction: { single: 12765, mfj: 26560 }, // std ded + pers exempt
  },
  { code: "KY", name: "Kentucky", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.035 }],
      mfj:    [{ from: 0, rate: 0.035 }],
    },
    baseDeduction: { single: 3360, mfj: 3360 }, // KY std ded doesn't double for MFJ
  },
  { code: "LA", name: "Louisiana", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.03 }],
      mfj:    [{ from: 0, rate: 0.03 }],
    },
    baseDeduction: { single: 12875, mfj: 25750 },
  },
  { code: "ME", name: "Maine", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.058 }, { from: 27399, rate: 0.0675 },
        { from: 64849, rate: 0.0715 },
      ],
      mfj: [
        { from: 0, rate: 0.058 }, { from: 54849, rate: 0.0675 },
        { from: 129749, rate: 0.0715 },
      ],
    },
    baseDeduction: { single: 13650, mfj: 27300 }, // $8,350 std + $5,300 pers exempt
  },
  { code: "MD", name: "Maryland", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.02 }, { from: 1000, rate: 0.03 },
        { from: 2000, rate: 0.04 }, { from: 3000, rate: 0.0475 },
        { from: 100000, rate: 0.05 }, { from: 125000, rate: 0.0525 },
        { from: 150000, rate: 0.055 }, { from: 250000, rate: 0.0575 },
        { from: 500000, rate: 0.0625 }, { from: 1000000, rate: 0.065 },
      ],
      mfj: [
        { from: 0, rate: 0.02 }, { from: 1000, rate: 0.03 },
        { from: 2000, rate: 0.04 }, { from: 3000, rate: 0.0475 },
        { from: 150000, rate: 0.05 }, { from: 175000, rate: 0.0525 },
        { from: 225000, rate: 0.055 }, { from: 300000, rate: 0.0575 },
        { from: 600000, rate: 0.0625 }, { from: 1200000, rate: 0.065 },
      ],
    },
    baseDeduction: { single: 6550, mfj: 13100 }, // $3,350 std + $3,200 pers exempt
  },
  { code: "MA", name: "Massachusetts", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.05 }, { from: 1083150, rate: 0.09 }],
      mfj:    [{ from: 0, rate: 0.05 }, { from: 1083150, rate: 0.09 }],
    },
    baseDeduction: { single: 4400, mfj: 8800 }, // personal exemption (no std ded)
    // MA PFML 2026: 0.46% employee share, capped at SS wage base
    // https://www.mass.gov/info-details/paid-family-and-medical-leave-employer-contribution-rates-and-calculator
    payrollTaxes: [
      { name: "PFML", rate: 0.0046, wageBase: SS_WAGE_BASE_2026 },
    ],
  },
  { code: "MI", name: "Michigan", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.0425 }],
      mfj:    [{ from: 0, rate: 0.0425 }],
    },
    baseDeduction: { single: 5900, mfj: 11800 }, // personal exemption
  },
  { code: "MN", name: "Minnesota", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.0535 }, { from: 33310, rate: 0.068 },
        { from: 109430, rate: 0.0785 }, { from: 203150, rate: 0.0985 },
      ],
      mfj: [
        { from: 0, rate: 0.0535 }, { from: 48700, rate: 0.068 },
        { from: 193480, rate: 0.0785 }, { from: 337930, rate: 0.0985 },
      ],
    },
    baseDeduction: { single: 15300, mfj: 30600 },
    // MN Paid Leave: 0.44% employee share, effective 1/1/2026, cap $814/yr
    // https://paidleave.mn.gov/
    payrollTaxes: [
      { name: "Paid Leave", rate: 0.0044, wageBase: 185000, annualCap: 814 },
    ],
  },
  { code: "MS", name: "Mississippi", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.04 }],
      mfj:    [{ from: 0, rate: 0.04 }],
    },
    baseDeduction: { single: 8300, mfj: 16600 }, // $2,300 std + $6,000 pers exempt
  },
  { code: "MO", name: "Missouri", hasIncomeTax: true,
    // Missouri's actual schedule has bracket increments every $1,313, topping at 4.7%
    // around $9,191. For incomes above ~$9k we treat it as effectively flat 4.7%.
    brackets: {
      single: [
        { from: 0, rate: 0 }, { from: 1313, rate: 0.02 }, { from: 2626, rate: 0.025 },
        { from: 3939, rate: 0.03 }, { from: 5252, rate: 0.035 }, { from: 6565, rate: 0.04 },
        { from: 7878, rate: 0.045 }, { from: 9191, rate: 0.047 },
      ],
      mfj: [
        { from: 0, rate: 0 }, { from: 1313, rate: 0.02 }, { from: 2626, rate: 0.025 },
        { from: 3939, rate: 0.03 }, { from: 5252, rate: 0.035 }, { from: 6565, rate: 0.04 },
        { from: 7878, rate: 0.045 }, { from: 9191, rate: 0.047 },
      ],
    },
    baseDeduction: { single: 16100, mfj: 32200 }, // ties to federal
  },
  { code: "MT", name: "Montana", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.047 }, { from: 47500, rate: 0.0565 }],
      mfj:    [{ from: 0, rate: 0.047 }, { from: 95000, rate: 0.0565 }],
    },
    baseDeduction: { single: 16100, mfj: 32200 },
  },
  { code: "NE", name: "Nebraska", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.0246 }, { from: 4130, rate: 0.0351 },
        { from: 24760, rate: 0.0455 },
      ],
      mfj: [
        { from: 0, rate: 0.0246 }, { from: 8250, rate: 0.0351 },
        { from: 49530, rate: 0.0455 },
      ],
    },
    baseDeduction: { single: 8850, mfj: 17700 },
  },
  { code: "NV", name: "Nevada", hasIncomeTax: false },
  { code: "NH", name: "New Hampshire", hasIncomeTax: false }, // I&D tax repealed eff. 2025
  { code: "NJ", name: "New Jersey", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.014 }, { from: 20000, rate: 0.0175 },
        { from: 35000, rate: 0.035 }, { from: 40000, rate: 0.0553 },
        { from: 75000, rate: 0.0637 }, { from: 500000, rate: 0.0897 },
        { from: 1000000, rate: 0.1075 },
      ],
      mfj: [
        { from: 0, rate: 0.014 }, { from: 20000, rate: 0.0175 },
        { from: 50000, rate: 0.0245 }, { from: 70000, rate: 0.035 },
        { from: 80000, rate: 0.0553 }, { from: 150000, rate: 0.0637 },
        { from: 500000, rate: 0.0897 }, { from: 1000000, rate: 0.1075 },
      ],
    },
    baseDeduction: { single: 1000, mfj: 2000 },
    // NJ TDI 0.19% + FLI 0.23%, both with wage base $171,100
    // https://www.nj.gov/labor/myleavebenefits/labor-standards/rates-and-thresholds/
    payrollTaxes: [
      { name: "TDI", rate: 0.0019, wageBase: 171100 },
      { name: "FLI", rate: 0.0023, wageBase: 171100 },
    ],
  },
  { code: "NM", name: "New Mexico", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.015 }, { from: 5500, rate: 0.032 },
        { from: 16500, rate: 0.043 }, { from: 33500, rate: 0.047 },
        { from: 66500, rate: 0.049 }, { from: 210000, rate: 0.059 },
      ],
      mfj: [
        { from: 0, rate: 0.015 }, { from: 8000, rate: 0.032 },
        { from: 25000, rate: 0.043 }, { from: 50000, rate: 0.047 },
        { from: 100000, rate: 0.049 }, { from: 315000, rate: 0.059 },
      ],
    },
    baseDeduction: { single: 16100, mfj: 32200 },
  },
  { code: "NY", name: "New York", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.039 }, { from: 8500, rate: 0.044 },
        { from: 11700, rate: 0.0515 }, { from: 13900, rate: 0.054 },
        { from: 80650, rate: 0.059 }, { from: 215400, rate: 0.0685 },
        { from: 1077550, rate: 0.0965 }, { from: 5000000, rate: 0.103 },
        { from: 25000000, rate: 0.109 },
      ],
      mfj: [
        { from: 0, rate: 0.039 }, { from: 17150, rate: 0.044 },
        { from: 23600, rate: 0.0515 }, { from: 27900, rate: 0.054 },
        { from: 161550, rate: 0.059 }, { from: 323200, rate: 0.0685 },
        { from: 2155350, rate: 0.0965 }, { from: 5000000, rate: 0.103 },
        { from: 25000000, rate: 0.109 },
      ],
    },
    baseDeduction: { single: 8000, mfj: 16050 },
    // NY SDI: 0.5% capped at $0.60/week ($31.20/yr); NY PFL 2026: 0.432% capped at $411.91
    // https://paidfamilyleave.ny.gov/2026 ; NY WCL §209
    payrollTaxes: [
      { name: "SDI", rate: 0.005, wageBase: null, annualCap: 31.20 },
      { name: "PFL", rate: 0.00432, wageBase: 95348.76, annualCap: 411.91 },
    ],
  },
  { code: "NC", name: "North Carolina", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.0399 }],
      mfj:    [{ from: 0, rate: 0.0399 }],
    },
    baseDeduction: { single: 12750, mfj: 25500 },
  },
  { code: "ND", name: "North Dakota", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0 }, { from: 48475, rate: 0.0195 },
        { from: 244825, rate: 0.025 },
      ],
      mfj: [
        { from: 0, rate: 0 }, { from: 80975, rate: 0.0195 },
        { from: 298075, rate: 0.025 },
      ],
    },
    baseDeduction: { single: 16100, mfj: 32200 },
  },
  { code: "OH", name: "Ohio", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0 }, { from: 26050, rate: 0.0275 }],
      mfj:    [{ from: 0, rate: 0 }, { from: 26050, rate: 0.0275 }],
    },
    baseDeduction: { single: 2400, mfj: 4800 }, // personal exemption (no std ded)
  },
  { code: "OK", name: "Oklahoma", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0 }, { from: 3750, rate: 0.025 },
        { from: 4900, rate: 0.035 }, { from: 7200, rate: 0.045 },
      ],
      mfj: [
        { from: 0, rate: 0 }, { from: 7500, rate: 0.025 },
        { from: 9800, rate: 0.035 }, { from: 14400, rate: 0.045 },
      ],
    },
    baseDeduction: { single: 7350, mfj: 14700 }, // std + pers exempt
  },
  { code: "OR", name: "Oregon", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.0475 }, { from: 4550, rate: 0.0675 },
        { from: 11400, rate: 0.0875 }, { from: 125000, rate: 0.099 },
      ],
      mfj: [
        { from: 0, rate: 0.0475 }, { from: 9100, rate: 0.0675 },
        { from: 22800, rate: 0.0875 }, { from: 250000, rate: 0.099 },
      ],
    },
    baseDeduction: { single: 2910, mfj: 5820 },
    // Paid Leave Oregon: 0.6% employee share, capped at SS wage base
    // https://paidleave.oregon.gov/
    payrollTaxes: [
      { name: "Paid Leave", rate: 0.006, wageBase: SS_WAGE_BASE_2026 },
    ],
  },
  { code: "PA", name: "Pennsylvania", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.0307 }],
      mfj:    [{ from: 0, rate: 0.0307 }],
    },
    baseDeduction: { single: 0, mfj: 0 },
  },
  { code: "RI", name: "Rhode Island", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.0375 }, { from: 82050, rate: 0.0475 },
        { from: 186450, rate: 0.0599 },
      ],
      mfj: [
        { from: 0, rate: 0.0375 }, { from: 82050, rate: 0.0475 },
        { from: 186450, rate: 0.0599 },
      ],
    },
    baseDeduction: { single: 16450, mfj: 32900 }, // $11,200 std + $5,250 pers exempt
    // RI TDI/TCI: 1.1% capped at $100,000
    // https://dlt.ri.gov/individuals/temporary-disability-caregiver-insurance
    payrollTaxes: [
      { name: "TDI/TCI", rate: 0.011, wageBase: 100000 },
    ],
  },
  { code: "SC", name: "South Carolina", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0 }, { from: 3640, rate: 0.03 },
        { from: 18230, rate: 0.06 },
      ],
      mfj: [
        { from: 0, rate: 0 }, { from: 3640, rate: 0.03 },
        { from: 18230, rate: 0.06 },
      ],
    },
    baseDeduction: { single: 8350, mfj: 16700 },
  },
  { code: "SD", name: "South Dakota", hasIncomeTax: false },
  { code: "TN", name: "Tennessee", hasIncomeTax: false },
  { code: "TX", name: "Texas", hasIncomeTax: false },
  { code: "UT", name: "Utah", hasIncomeTax: true,
    brackets: {
      single: [{ from: 0, rate: 0.045 }],
      mfj:    [{ from: 0, rate: 0.045 }],
    },
    baseDeduction: { single: 0, mfj: 0 }, // UT uses a taxpayer credit instead — ignored for simplicity
  },
  { code: "VT", name: "Vermont", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.0335 }, { from: 49400, rate: 0.066 },
        { from: 119700, rate: 0.076 }, { from: 249700, rate: 0.0875 },
      ],
      mfj: [
        { from: 0, rate: 0.0335 }, { from: 82500, rate: 0.066 },
        { from: 199450, rate: 0.076 }, { from: 304000, rate: 0.0875 },
      ],
    },
    baseDeduction: { single: 12950, mfj: 25900 }, // $7,650 std + $5,300 pers exempt
  },
  { code: "VA", name: "Virginia", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.02 }, { from: 3000, rate: 0.03 },
        { from: 5000, rate: 0.05 }, { from: 17000, rate: 0.0575 },
      ],
      mfj: [
        { from: 0, rate: 0.02 }, { from: 3000, rate: 0.03 },
        { from: 5000, rate: 0.05 }, { from: 17000, rate: 0.0575 },
      ],
    },
    baseDeduction: { single: 9680, mfj: 19360 }, // $8,750 std + $930 pers exempt
  },
  { code: "WA", name: "Washington", hasIncomeTax: false,
    // WA has a 7% capital gains tax above $278k — does not apply to wages.
    // WA PFML: 1.13% premium × employees pay ~71.43% share = ~0.807%
    // https://paidleave.wa.gov/employers/
    payrollTaxes: [
      { name: "PFML", rate: 0.00807, wageBase: SS_WAGE_BASE_2026 },
    ],
  },
  { code: "WV", name: "West Virginia", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.0222 }, { from: 10000, rate: 0.0296 },
        { from: 25000, rate: 0.0333 }, { from: 40000, rate: 0.0444 },
        { from: 60000, rate: 0.0482 },
      ],
      mfj: [
        { from: 0, rate: 0.0222 }, { from: 10000, rate: 0.0296 },
        { from: 25000, rate: 0.0333 }, { from: 40000, rate: 0.0444 },
        { from: 60000, rate: 0.0482 },
      ],
    },
    baseDeduction: { single: 2000, mfj: 4000 },
  },
  { code: "WI", name: "Wisconsin", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.035 }, { from: 15110, rate: 0.044 },
        { from: 51950, rate: 0.053 }, { from: 332720, rate: 0.0765 },
      ],
      mfj: [
        { from: 0, rate: 0.035 }, { from: 20150, rate: 0.044 },
        { from: 69260, rate: 0.053 }, { from: 443630, rate: 0.0765 },
      ],
    },
    baseDeduction: { single: 14660, mfj: 27240 }, // $13,960 std + $700 pers exempt
  },
  { code: "WY", name: "Wyoming", hasIncomeTax: false },
  { code: "DC", name: "District of Columbia", hasIncomeTax: true,
    brackets: {
      single: [
        { from: 0, rate: 0.04 }, { from: 10000, rate: 0.06 },
        { from: 40000, rate: 0.065 }, { from: 60000, rate: 0.085 },
        { from: 250000, rate: 0.0925 }, { from: 500000, rate: 0.0975 },
        { from: 1000000, rate: 0.1075 },
      ],
      mfj: [
        { from: 0, rate: 0.04 }, { from: 10000, rate: 0.06 },
        { from: 40000, rate: 0.065 }, { from: 60000, rate: 0.085 },
        { from: 250000, rate: 0.0925 }, { from: 500000, rate: 0.0975 },
        { from: 1000000, rate: 0.1075 },
      ],
    },
    baseDeduction: { single: 16100, mfj: 32200 },
    // DC PFL is 100% employer-paid — no employee contribution.
  },
];
