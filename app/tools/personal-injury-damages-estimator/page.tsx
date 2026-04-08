import type { Metadata } from "next";
import PersonalInjuryClient from "./client";

export const metadata: Metadata = {
  title: "Personal Injury Damages Estimator",
  description:
    "Estimate personal injury damages including medical expenses, lost earnings, property damage, and non-economic damages.",
  alternates: { canonical: "/tools/personal-injury-damages-estimator" },
};

export default function PersonalInjuryDamagesEstimatorPage() {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-accent mb-1">
          Calculators
        </p>
        <h1 className="text-3xl font-bold text-brand-primary">
          Personal Injury Damages Estimator
        </h1>
        <p className="mt-2 text-brand-muted max-w-2xl">
          Estimate personal injury damages. The non-economic damages multiplier
          applies to total medical expenses. Enter values and press Enter or tab
          away to update the totals.
        </p>
      </div>
      <PersonalInjuryClient />
    </>
  );
}
