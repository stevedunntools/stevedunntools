export const navGroups = [
  {
    label: "Negotiation Tools",
    links: [
      { href: "/tools/negotiation-visualizer", label: "Negotiation Visualizer" },
      { href: "/tools/bracket-generator", label: "Bracket Generator" },
      { href: "/tools/convergence-calculator", label: "Point of Intersection" },
    ],
  },
  {
    label: "Damages & Case Value",
    links: [
      { href: "/tools/employment-damages-estimator", label: "Employment Damages Estimator" },
      { href: "/tools/personal-injury-damages-estimator", label: "Personal Injury Damages Estimator" },
      { href: "/tools/plaintiffs-expected-value", label: "Plaintiff's Expected Value" },
      { href: "/tools/defendants-expected-cost", label: "Defendant's Expected Cost" },
    ],
  },
  {
    label: "Money Math",
    links: [
      { href: "/tools/contingency-calculator", label: "Contingency Calculator" },
      { href: "/tools/employment-contingency-calculator", label: "Employment Contingency Calculator" },
      { href: "/tools/simple-interest-calculator", label: "Simple Interest Calculator" },
      { href: "/tools/payment-over-time", label: "Payment Over Time Calculator" },
      { href: "/tools/take-home-after-taxes", label: "Rough Guess After Taxes Estimator" },
    ],
  },
  {
    label: "Date Tools",
    links: [
      { href: "/tools/days-between-dates", label: "Days Between Dates" },
      { href: "/tools/add-subtract-date", label: "Add/Subtract from Date" },
    ],
  },
  {
    label: "About",
    links: [
      { href: "/about", label: "About Steve Dunn" },
    ],
  },
];

export const allToolLinks = navGroups
  .filter((g) => g.label !== "About")
  .flatMap((g) => g.links);

/** Category label for a tool route, derived from the nav so it can't go stale. */
export function toolCategory(href: string): string {
  return navGroups.find((g) => g.links.some((l) => l.href === href))?.label ?? "Tools";
}

/** One-line description per tool, used on the homepage cards and related-tools links. */
export const toolDescriptions: Record<string, string> = {
  // Negotiation Tools
  "/tools/negotiation-visualizer":
    "Visualize the negotiation process with an interactive chart of offers, counteroffers, and brackets.",
  "/tools/bracket-generator":
    "Automatically calculate bracketed offer ranges.",
  "/tools/convergence-calculator":
    "Enter two offers from each party. The tool shows where the lines would intersect if the pattern continued.",

  // Damages & Case Value
  "/tools/employment-damages-estimator":
    "Calculate potential employment damages including lost wages, benefits, and emotional distress.",
  "/tools/personal-injury-damages-estimator":
    "Estimate personal injury damages including medical costs, lost earnings, and non-economic damages.",
  "/tools/plaintiffs-expected-value":
    "Calculate the probability-weighted expected value of a plaintiff's case, adjusted for costs and the time value of money.",
  "/tools/defendants-expected-cost":
    "Estimate the defendant's total expected cost including liability risk, damages exposure, and defense costs.",

  // Money Math
  "/tools/contingency-calculator":
    "Calculate plaintiff's net recovery after fees and costs.",
  "/tools/employment-contingency-calculator":
    "Calculate net recovery with wage and non-wage allocation for employment settlements.",
  "/tools/simple-interest-calculator":
    "Calculate simple interest on any amount over any time period at any rate.",
  "/tools/take-home-after-taxes":
    "Estimate take-home pay after federal and state taxes for W-2, 1099, and tax-free personal injury income.",
  "/tools/payment-over-time":
    "Build a complete payment schedule for settlements paid in installments.",

  // Date Tools
  "/tools/days-between-dates":
    "Calculate the number of years, months, weeks, and days between two dates.",
  "/tools/add-subtract-date":
    "Add or subtract years, months, weeks, and days from a date.",
};
