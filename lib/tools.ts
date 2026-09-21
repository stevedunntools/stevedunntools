import { Brackets, Briefcase, CalendarClock, CalendarPlus, CalendarRange, Coins, Gavel, GitMerge, HandCoins, LineChart, Percent, Receipt, Shield, Stethoscope, type LucideIcon } from "lucide-react";

/**
 * The one place a tool is defined. Navigation, the home/tools cards, each
 * page's metadata and header, the share image, the sitemap and related-tools
 * links all read from here, so adding a tool is: one entry, one folder.
 */
export type ToolCategory = "Negotiation Tools" | "Damages & Case Value" | "Money Math" | "Date Tools";

export interface ToolDef {
  slug: string;
  /** Name shown on the page (H1), in menus and cards. */
  label: string;
  /** Search-facing title for the browser tab and share card; defaults to label. */
  seoTitle?: string;
  /** Title drawn on the share image when it should differ from the label. */
  ogTitle?: string;
  category: ToolCategory;
  icon: LucideIcon;
  /** One line under the name on the home/tools cards and related-tools links. */
  cardDescription: string;
  /** Meta description (search snippet). */
  metaDescription: string;
  /** The sentence or two under the H1. */
  pageDescription: string;
  /** Short line on the share image. */
  tagline: string;
}

export const CATEGORIES: { label: ToolCategory; description: string }[] = [
  { label: "Negotiation Tools", description: "Visualize offers, build brackets, and project where talks are heading." },
  { label: "Damages & Case Value", description: "Estimate what a case is worth from both sides." },
  { label: "Money Math", description: "Fees, interest, payment schedules, and taxes on settlements." },
  { label: "Date Tools", description: "Quick calendar arithmetic." },
];

export const TOOLS: ToolDef[] = [
  {
    slug: "negotiation-visualizer",
    label: "Negotiation Visualizer",
    seoTitle: "Settlement Negotiation Visualizer",
    category: "Negotiation Tools",
    icon: LineChart,
    cardDescription: "Visualize the negotiation process with an interactive chart of offers, counteroffers, and brackets.",
    metaDescription: "Visualize the negotiation process with an interactive chart of offers, counteroffers, and convergence patterns.",
    pageDescription: "Chart offers and brackets from both parties to visualize convergence. Numerical offers appear as connected dots; brackets appear as shaded ranges. Overlapping bracket zones are highlighted in green.",
    tagline: "Interactive chart of offers, counteroffers, and brackets.",
  },
  {
    slug: "bracket-generator",
    label: "Bracket Generator",
    seoTitle: "Settlement Bracket Calculator",
    category: "Negotiation Tools",
    icon: Brackets,
    cardDescription: "Automatically calculate bracketed offer ranges.",
    metaDescription: "Generate a bracketed offer range by entering any two of our number, their number, and midpoint.",
    pageDescription: "Enter any two of the three values and the third will calculate automatically. Changing an endpoint recalculates the midpoint. Changing the midpoint shifts both endpoints by equal amounts, keeping the spread the same.",
    tagline: "Calculate bracketed offer ranges from any two values.",
  },
  {
    slug: "convergence-calculator",
    label: "Point of Intersection",
    seoTitle: "Negotiation Convergence Calculator",
    category: "Negotiation Tools",
    icon: GitMerge,
    cardDescription: "Enter two offers from each party. The tool shows where the lines would intersect if the pattern continued.",
    metaDescription: "Enter two offers from each side and see where the negotiation would converge if the pattern continued \u2014 or what it takes to land on your target number.",
    pageDescription: "Enter two offers from each party. The tool shows where the lines would intersect if the pattern continued. You may also enter a desired settlement number to see how the parties' moves would need to adjust to reach that result.",
    tagline: "See where two negotiating parties would converge.",
  },
  {
    slug: "employment-damages-estimator",
    label: "Employment Damages Estimator",
    category: "Damages & Case Value",
    icon: Briefcase,
    cardDescription: "Calculate potential employment damages including lost wages, benefits, and emotional distress.",
    metaDescription: "Estimate employment damages including back pay, front pay, benefits, liquidated damages, and more.",
    pageDescription: "Estimate potential employment damages including back pay, mitigation, front pay, and additional damages.",
    tagline: "Back pay, front pay, benefits, and more.",
  },
  {
    slug: "personal-injury-damages-estimator",
    label: "Personal Injury Damages Estimator",
    seoTitle: "Personal Injury Settlement Calculator",
    category: "Damages & Case Value",
    icon: Stethoscope,
    cardDescription: "Estimate personal injury damages including medical costs, lost earnings, and non-economic damages.",
    metaDescription: "Estimate personal injury damages including medical expenses, lost earnings, property damage, and non-economic damages.",
    pageDescription: "Estimate personal injury damages. The non-economic damages multiplier applies to total medical expenses.",
    tagline: "Medical costs, lost earnings, and non-economic damages.",
  },
  {
    slug: "plaintiffs-expected-value",
    label: "Plaintiff's Expected Value",
    category: "Damages & Case Value",
    icon: Gavel,
    cardDescription: "Calculate the probability-weighted expected value of a plaintiff's case, adjusted for costs and the time value of money.",
    metaDescription: "Calculate the probability-weighted expected value of a plaintiff's case, adjusted for costs and the time value of money.",
    pageDescription: "Calculate the expected value of a case adjusted for probability of success and time value of money, less fees and costs.",
    tagline: "Probability-weighted case value, adjusted for costs.",
  },
  {
    slug: "defendants-expected-cost",
    label: "Defendant's Expected Cost",
    seoTitle: "Defendant's Expected Cost Calculator",
    category: "Damages & Case Value",
    icon: Shield,
    cardDescription: "Estimate the defendant's total expected cost including liability risk, damages exposure, and defense costs.",
    metaDescription: "Estimate the defendant's total expected cost including liability risk, damages exposure, and defense costs.",
    pageDescription: "Estimate the defendant's total expected cost of litigation, including probability-adjusted damages and fee exposure, plus defense costs.",
    tagline: "Liability risk, damages exposure, and defense costs.",
  },
  {
    slug: "contingency-calculator",
    label: "Contingency Calculator",
    seoTitle: "Contingency Fee Calculator",
    category: "Money Math",
    icon: Percent,
    cardDescription: "Calculate plaintiff's net recovery after fees and costs.",
    metaDescription: "Calculate attorney fees under a contingency arrangement and the net recovery to the plaintiff.",
    pageDescription: "Calculate attorney fees and the plaintiff's net recovery under a contingency fee arrangement.",
    tagline: "Attorney fees and net recovery under a contingency arrangement.",
  },
  {
    slug: "employment-contingency-calculator",
    label: "W-2, 1099, and Attorney Fee Calculator",
    seoTitle: "Employment Settlement Fee Calculator",
    category: "Money Math",
    icon: HandCoins,
    cardDescription: "Calculate net recovery with wage and non-wage allocation for employment settlements.",
    metaDescription: "Calculate attorney fees, net recovery, and wage vs. non-wage allocation for employment settlements.",
    pageDescription: "Calculate the plaintiff's net recovery under a contingency fee arrangement, with allocation between wages and non-wage income for tax purposes.",
    tagline: "Net recovery with wage vs. non-wage allocation.",
  },
  {
    slug: "simple-interest-calculator",
    label: "Simple Interest Calculator",
    category: "Money Math",
    icon: Coins,
    cardDescription: "Calculate simple interest on any amount over any time period at any rate.",
    metaDescription: "Calculate simple interest on any amount over any time period at any rate.",
    pageDescription: "Calculate simple interest on any principal amount over any time period.",
    tagline: "Simple interest on any amount, over any period, at any rate.",
  },
  {
    slug: "payment-over-time",
    label: "Payment Over Time Calculator",
    category: "Money Math",
    icon: CalendarClock,
    cardDescription: "Build a complete payment schedule for settlements paid in installments.",
    metaDescription: "Build a complete payment schedule for settlements paid in installments with interest.",
    pageDescription: "Build a complete payment schedule for a settlement paid with up-front payments and installments.",
    tagline: "Payment schedules for settlements paid in installments.",
  },
  {
    slug: "take-home-after-taxes",
    label: "Rough Guess After Taxes Estimator",
    seoTitle: "Settlement Take-Home Pay After Taxes",
    ogTitle: "Settlement Take-Home After Taxes",
    category: "Money Math",
    icon: Receipt,
    cardDescription: "Estimate take-home pay after federal and state taxes for W-2, 1099, and tax-free personal injury income.",
    metaDescription: "Estimate take-home pay after federal and state taxes for W-2 wages, 1099 income, and tax-free personal injury proceeds. 2026 tax year.",
    pageDescription: "Enter wages, 1099 income, and any tax-free personal injury proceeds to see an estimate of after-tax take-home pay for tax year 2026. Useful for modeling settlement allocations.",
    tagline: "A rough guess at take-home pay after federal and state taxes.",
  },
  {
    slug: "days-between-dates",
    label: "Days Between Dates",
    seoTitle: "Days Between Dates Calculator",
    category: "Date Tools",
    icon: CalendarRange,
    cardDescription: "Calculate the number of years, months, weeks, and days between two dates.",
    metaDescription: "Calculate the number of years, months, weeks, and days between two dates.",
    pageDescription: "Calculate the duration between two dates, expressed in multiple formats.",
    tagline: "Years, months, weeks, and days between two dates.",
  },
  {
    slug: "add-subtract-date",
    label: "Add/Subtract from Date",
    seoTitle: "Add or Subtract from a Date Calculator",
    category: "Date Tools",
    icon: CalendarPlus,
    cardDescription: "Add or subtract years, months, weeks, and days from a date.",
    metaDescription: "Add or subtract years, months, weeks, and days from a date, with business day support.",
    pageDescription: "Add or subtract years, months, weeks, and/or days from a date. Enable business days to skip weekends and federal holidays.",
    tagline: "Add or subtract years, months, weeks, and days from any date.",
  },
];

export const toolHref = (slug: string) => `/tools/${slug}`;

export function toolBySlug(slug: string): ToolDef {
  const t = TOOLS.find((x) => x.slug === slug);
  if (!t) throw new Error(`Unknown tool: ${slug}`);
  return t;
}
