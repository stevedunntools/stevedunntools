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
import { navGroups, toolDescriptions } from "@/lib/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
    card: "bg-category-negotiation-50/50 border-category-negotiation-200/70",
    hover: "hover:border-category-negotiation-400",
    iconBg:
      "bg-category-negotiation-100 group-hover:bg-category-negotiation-200",
    iconColor: "text-category-negotiation-700",
    titleHover: "group-hover:text-category-negotiation-700",
  },
  "Damages & Case Value": {
    card: "bg-category-damages-50/50 border-category-damages-200/70",
    hover: "hover:border-category-damages-400",
    iconBg: "bg-category-damages-100 group-hover:bg-category-damages-200",
    iconColor: "text-category-damages-700",
    titleHover: "group-hover:text-category-damages-700",
  },
  "Money Math": {
    card: "bg-category-money-50/50 border-category-money-200/70",
    hover: "hover:border-category-money-500",
    iconBg: "bg-category-money-100 group-hover:bg-category-money-200",
    iconColor: "text-category-money-700",
    titleHover: "group-hover:text-category-money-700",
  },
  "Date Tools": {
    card: "bg-category-dates-50/50 border-category-dates-200/70",
    hover: "hover:border-category-dates-400",
    iconBg: "bg-category-dates-100 group-hover:bg-category-dates-200",
    iconColor: "text-category-dates-700",
    titleHover: "group-hover:text-category-dates-700",
  },
};

const toolCategories = navGroups.filter((g) => g.label !== "About");

/**
 * All tools grouped by category, rendered as cards. Shared by the homepage
 * and the /tools hub so the two never drift apart.
 */
export default function ToolCardGrid() {
  return (
    <>
      {toolCategories.map((group) => {
        const styles = categoryStyles[group.label];
        return (
          <div key={group.label} id={group.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")} className="mb-12 last:mb-0 scroll-mt-24">
            <div className="mb-5">
              <h2 className="text-lg font-semibold tracking-tight text-brand-primary">
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
                    className="group rounded-xl focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:outline-none"
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
    </>
  );
}
