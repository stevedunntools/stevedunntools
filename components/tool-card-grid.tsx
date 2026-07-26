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
    </>
  );
}
