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
    label: "Settlement Analysis",
    links: [
      { href: "/tools/employment-damages-estimator", label: "Employment Damages Estimator" },
      { href: "/tools/personal-injury-damages-estimator", label: "Personal Injury Damages Estimator" },
      { href: "/tools/plaintiffs-expected-value", label: "Plaintiff's Expected Value" },
      { href: "/tools/defendants-expected-cost", label: "Defendant's Expected Cost" },
    ],
  },
  {
    label: "Calculators",
    links: [
      { href: "/tools/contingency-calculator", label: "Contingency Calculator" },
      { href: "/tools/tax-allocation-calculator", label: "Tax Allocation Calculator" },
      { href: "/tools/plaintiffs-net-take-home", label: "Plaintiff's Net Take-Home Calculator" },
      { href: "/tools/simple-interest-calculator", label: "Simple Interest Calculator" },
      { href: "/tools/payment-over-time", label: "Payment Over Time Calculator" },
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
