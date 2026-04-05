import type { Metadata } from "next";
import DefendantsExpectedCostClient from "./client";

export const metadata: Metadata = {
  title: "Defendant's Expected Cost | Steve Dunn Tools",
  description:
    "Estimate the defendant's total expected cost including liability risk, damages exposure, and defense costs.",
};

export default function DefendantsExpectedCostPage() {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-accent mb-1">
          Calculators
        </p>
        <h1 className="text-3xl font-bold text-brand-primary">
          Defendant&apos;s Expected Cost
        </h1>
        <p className="mt-2 text-brand-muted max-w-2xl">
          Estimate the defendant&apos;s total expected cost of litigation,
          including probability-adjusted damages and fee exposure, plus defense
          costs. If you have already filled out a damages estimator, the damages
          amount will be pre-filled.
        </p>
      </div>
      <DefendantsExpectedCostClient />
    </>
  );
}
