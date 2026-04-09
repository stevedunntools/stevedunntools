import type { Metadata } from "next";
import DefendantsExpectedCostClient from "./client";
import SteveNote from "@/components/steve-note";

export const metadata: Metadata = {
  title: "Defendant's Expected Cost",
  description:
    "Estimate the defendant's total expected cost including liability risk, damages exposure, and defense costs.",
  alternates: { canonical: "/tools/defendants-expected-cost" },
};

export default function DefendantsExpectedCostPage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-medium text-brand-accent mb-1">
            Calculators
          </p>
          <h1 className="text-3xl font-bold text-brand-primary">
            Defendant&apos;s Expected Cost
          </h1>
          <p className="mt-2 text-brand-muted max-w-2xl">
            Estimate the defendant&apos;s total expected cost of litigation,
            including probability-adjusted damages and fee exposure, plus defense
            costs.
          </p>
        </div>
        <SteveNote note="This tool estimates the cost of litigation based on the probability-weighted exposure on damages, the risk of fee-shifting, and the defendant's certain expenses — attorney fees, costs, and intangibles. For a complete picture, run the numbers a few ways: a best case scenario, worst case scenario, and something in between." />
      </div>
      <DefendantsExpectedCostClient />
    </>
  );
}
