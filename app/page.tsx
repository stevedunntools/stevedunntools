import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const toolCards = [
  {
    category: "Settlement Analysis",
    tools: [
      {
        href: "/tools/settlement-range",
        title: "Settlement Range Calculator",
        description:
          "Estimate a realistic settlement range using claim values, risk factors, and litigation costs.",
      },
      {
        href: "/tools/batna-analysis",
        title: "BATNA Analysis",
        description:
          "Evaluate your Best Alternative to a Negotiated Agreement and strengthen your position.",
      },
      {
        href: "/tools/risk-assessment",
        title: "Risk Assessment",
        description:
          "Quantify litigation risk across multiple outcome scenarios with weighted probabilities.",
      },
    ],
  },
  {
    category: "Negotiation Tools",
    tools: [
      {
        href: "/tools/bracket-generator",
        title: "Bracket Generator",
        description:
          "Generate bracketed offer ranges to propose structured negotiation moves.",
      },
      {
        href: "/tools/move-tracker",
        title: "Move Tracker",
        description:
          "Track offer and counteroffer patterns to identify momentum and convergence trends.",
      },
      {
        href: "/tools/zone-of-possible-agreement",
        title: "ZOPA Calculator",
        description:
          "Identify the zone of possible agreement based on each party's reservation values.",
      },
    ],
  },
  {
    category: "Employment",
    tools: [
      {
        href: "/tools/damages-calculator",
        title: "Damages Calculator",
        description:
          "Calculate potential employment damages including lost wages, benefits, and emotional distress.",
      },
      {
        href: "/tools/severance-estimator",
        title: "Severance Estimator",
        description:
          "Estimate reasonable severance packages based on tenure, role, and industry benchmarks.",
      },
    ],
  },
];

export default function Home() {
  return (
    <div className="bg-brand-bg">
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-brand-primary">
            Mediation tools built by a mediator.
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-brand-muted">
            Practical calculators and utilities for lawyers, mediators, and
            parties in dispute resolution. Free, fast, and private — nothing
            leaves your browser.
          </p>
        </div>
      </section>

      {/* Tool Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {toolCards.map((group) => (
            <div key={group.category} className="mb-12 last:mb-0">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-muted mb-4">
                {group.category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {group.tools.map((tool) => (
                  <Link key={tool.href} href={tool.href} className="group">
                    <Card className="h-full bg-brand-card border-brand-border hover:border-brand-accent hover:shadow-md transition-all duration-200">
                      <CardHeader>
                        <CardTitle className="text-brand-primary group-hover:text-brand-accent transition-colors">
                          {tool.title}
                        </CardTitle>
                        <CardDescription className="text-brand-muted">
                          {tool.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
