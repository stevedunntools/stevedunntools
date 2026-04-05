export const navGroups = [
  {
    label: "Negotiation Tools",
    links: [
      { href: "/tools/negotiation-visualizer", label: "Negotiation Visualizer" },
      { href: "/tools/bracket-generator", label: "Bracket Generator" },
      { href: "/tools/convergence-calculator", label: "Convergence Calculator" },
    ],
  },
  {
    label: "Calculators",
    links: [
      { href: "/tools/employment-damages-estimator", label: "Employment Damages Estimator" },
      { href: "/tools/personal-injury-damages-estimator", label: "Personal Injury Damages Estimator" },
      { href: "/tools/plaintiffs-expected-value", label: "Plaintiff's Expected Value" },
      { href: "/tools/defendants-expected-cost", label: "Defendant's Expected Cost" },
      { href: "/tools/contingency-calculator", label: "Contingency Calculator" },
      { href: "/tools/employment-contingency-calculator", label: "Employment Contingency Calculator" },
      { href: "/tools/simple-interest-calculator", label: "Simple Interest Calculator" },
      { href: "/tools/payment-over-time", label: "Payment Over Time Calculator" },
      { href: "/tools/days-between-dates", label: "Days Between Dates" },
      { href: "/tools/add-subtract-date", label: "Add/Subtract from Date" },
    ],
  },
  {
    label: "About",
    links: [
      { href: "/about", label: "About Steve Dunn" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export const allToolLinks = navGroups
  .filter((g) => g.label !== "About")
  .flatMap((g) => g.links);
