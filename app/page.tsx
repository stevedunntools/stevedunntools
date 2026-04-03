import Link from "next/link";
import { navGroups } from "@/lib/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const toolDescriptions: Record<string, string> = {
  // Negotiation Tools
  "/tools/negotiation-visualizer":
    "Visualize the negotiation process with an interactive chart of offers, counteroffers, and convergence patterns.",
  "/tools/bracket-generator":
    "Generate bracketed offer ranges to propose structured negotiation moves.",
  "/tools/trend-analyzer":
    "Analyze negotiation momentum by tracking offer patterns and predicting settlement trajectories.",

  // Settlement Analysis
  "/tools/simple-damages-estimator":
    "Quickly estimate total damages with a streamlined set of inputs for straightforward disputes.",
  "/tools/employment-damages-estimator":
    "Calculate potential employment damages including lost wages, benefits, and emotional distress.",
  "/tools/personal-injury-damages-estimator":
    "Estimate personal injury damages across medical costs, lost earnings, pain and suffering, and more.",
  "/tools/plaintiffs-expected-value":
    "Calculate the probability-weighted expected value of a plaintiff's case across multiple scenarios.",
  "/tools/defendants-expected-cost":
    "Estimate the defendant's total expected cost including liability risk, damages exposure, and defense costs.",

  // Calculators
  "/tools/contingency-calculator":
    "Calculate attorney fees under various contingency arrangements and their impact on net recovery.",
  "/tools/tax-allocation-calculator":
    "Allocate settlement proceeds across tax categories to estimate after-tax value.",
  "/tools/plaintiffs-net-take-home":
    "Calculate what the plaintiff actually takes home after fees, liens, costs, and taxes.",
  "/tools/simple-interest-calculator":
    "Calculate simple interest on any amount over any time period at any rate.",
  "/tools/payment-over-time":
    "Build a complete payment schedule for settlements paid in installments with interest.",
};

const toolCategories = navGroups.filter((g) => g.label !== "About");

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
          {toolCategories.map((group) => (
            <div key={group.label} className="mb-12 last:mb-0">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-muted mb-4">
                {group.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {group.links.map((tool) => (
                  <Link key={tool.href} href={tool.href} className="group rounded-lg focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:outline-none">
                    <Card className="h-full bg-brand-card border-brand-border hover:border-brand-accent hover:shadow-md transition-all duration-200">
                      <CardHeader>
                        <CardTitle className="text-brand-primary group-hover:text-brand-accent transition-colors">
                          {tool.label}
                        </CardTitle>
                        <CardDescription className="text-brand-muted">
                          {toolDescriptions[tool.href] ?? "Coming soon."}
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
