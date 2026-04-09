import type { Metadata } from "next";
import PersonalInjuryClient from "./client";
import SteveNote from "@/components/steve-note";

export const metadata: Metadata = {
  title: "Personal Injury Damages Estimator",
  description:
    "Estimate personal injury damages including medical expenses, lost earnings, property damage, and non-economic damages.",
  alternates: { canonical: "/tools/personal-injury-damages-estimator" },
};

export default function PersonalInjuryDamagesEstimatorPage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
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
        <SteveNote note="This uses the multiplier method to estimate personal injury damages. The multiplier (ranging from 1x to 5x) is applied to your total medical expenses — past and future combined — to estimate pain and suffering. It's a widely used approach, but keep in mind it's a starting point, not a final answer. The multiplier you choose should reflect the severity of the injury, the quality of the documentation, and the jurisdiction. Try running it at a few different multiplier levels to see the range of outcomes — that range is often more useful in a negotiation than any single number." />
      </div>
      <PersonalInjuryClient />
    </>
  );
}
