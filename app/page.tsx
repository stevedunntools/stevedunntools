import type { Metadata } from "next";
import Link from "next/link";
import {
  Brackets,
  Briefcase,
  CalendarClock,
  CalendarPlus,
  CalendarRange,
  Coins,
  Gavel,
  GitMerge,
  HandCoins,
  LineChart,
  Percent,
  Receipt,
  Shield,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { navGroups } from "@/lib/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Steve Dunn Tools — Settlement Tools Built by a Mediator",
  description:
    "Practical settlement tools built by a mediator. Free calculators and utilities for lawyers, mediators, and parties in dispute resolution.",
  alternates: {
    canonical: "/",
  },
};

const toolDescriptions: Record<string, string> = {
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

const toolIcons: Record<string, LucideIcon> = {
  "/tools/negotiation-visualizer": LineChart,
  "/tools/bracket-generator": Brackets,
  "/tools/convergence-calculator": GitMerge,

  "/tools/employment-damages-estimator": Briefcase,
  "/tools/personal-injury-damages-estimator": Stethoscope,
  "/tools/plaintiffs-expected-value": Gavel,
  "/tools/defendants-expected-cost": Shield,

  "/tools/contingency-calculator": Percent,
  "/tools/employment-contingency-calculator": HandCoins,
  "/tools/simple-interest-calculator": Coins,
  "/tools/payment-over-time": CalendarClock,
  "/tools/take-home-after-taxes": Receipt,

  "/tools/days-between-dates": CalendarRange,
  "/tools/add-subtract-date": CalendarPlus,
};

const categoryDescriptions: Record<string, string> = {
  "Negotiation Tools":
    "Visualize offers, build brackets, and project where talks are heading.",
  "Damages & Case Value":
    "Estimate what a case is worth from both sides.",
  "Money Math":
    "Fees, interest, payment schedules, and taxes on settlements.",
  "Date Tools": "Quick calendar arithmetic.",
};

interface CategoryStyle {
  card: string;
  hover: string;
  iconBg: string;
  iconColor: string;
  titleHover: string;
}

const categoryStyles: Record<string, CategoryStyle> = {
  "Negotiation Tools": {
    card: "bg-blue-50/50 border-blue-200/70",
    hover: "hover:border-blue-400",
    iconBg: "bg-blue-100 group-hover:bg-blue-200",
    iconColor: "text-blue-700",
    titleHover: "group-hover:text-blue-700",
  },
  "Damages & Case Value": {
    card: "bg-red-50/50 border-red-200/70",
    hover: "hover:border-red-400",
    iconBg: "bg-red-100 group-hover:bg-red-200",
    iconColor: "text-red-700",
    titleHover: "group-hover:text-red-700",
  },
  "Money Math": {
    card: "bg-emerald-50/50 border-emerald-200/70",
    hover: "hover:border-emerald-500",
    iconBg: "bg-emerald-100 group-hover:bg-emerald-200",
    iconColor: "text-emerald-700",
    titleHover: "group-hover:text-emerald-700",
  },
  "Date Tools": {
    card: "bg-violet-50/50 border-violet-200/70",
    hover: "hover:border-violet-400",
    iconBg: "bg-violet-100 group-hover:bg-violet-200",
    iconColor: "text-violet-700",
    titleHover: "group-hover:text-violet-700",
  },
};

const toolCategories = navGroups.filter((g) => g.label !== "About");

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Steve Dunn Tools",
  url: "https://stevedunntools.com",
  description:
    "Practical settlement tools built by a mediator. Free calculators and utilities for lawyers, mediators, and parties in dispute resolution.",
  author: {
    "@type": "Person",
    name: "Steve Dunn",
    jobTitle: "Mediator",
    url: "https://stevedunntools.com/about",
  },
};

export default function Home() {
  return (
    <div className="bg-brand-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="py-12 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-primary">
            Settlement tools built by a mediator.
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
          {toolCategories.map((group) => {
            const styles = categoryStyles[group.label];
            return (
              <div key={group.label} className="mb-12 last:mb-0">
                <div className="mb-5">
                  <h2 className="text-base font-semibold text-brand-primary">
                    {group.label}
                  </h2>
                  {categoryDescriptions[group.label] && (
                    <p className="mt-1 text-sm text-brand-muted">
                      {categoryDescriptions[group.label]}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {group.links.map((tool) => {
                    const Icon = toolIcons[tool.href];
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="group rounded-lg focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:outline-none"
                      >
                        <Card
                          className={`h-full ${styles?.card ?? "bg-brand-card border-brand-border"} ${styles?.hover ?? "hover:border-brand-accent"} hover:shadow-md transition-all duration-200`}
                        >
                          <CardHeader>
                            <div className="flex items-start gap-3">
                              {Icon && (
                                <div
                                  className={`shrink-0 w-10 h-10 rounded-lg ${styles?.iconBg ?? "bg-brand-accent/10 group-hover:bg-brand-accent/15"} flex items-center justify-center transition-colors`}
                                >
                                  <Icon
                                    className={`h-5 w-5 ${styles?.iconColor ?? "text-brand-accent"}`}
                                  />
                                </div>
                              )}
                              <CardTitle
                                className={`text-brand-primary ${styles?.titleHover ?? "group-hover:text-brand-accent"} transition-colors pt-1.5`}
                              >
                                {tool.label}
                              </CardTitle>
                            </div>
                            <CardDescription className="text-brand-muted mt-3">
                              {toolDescriptions[tool.href] ?? "Coming soon."}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
