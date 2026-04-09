import type { Metadata } from "next";
import EmploymentDamagesClient from "./client";
import SteveNote from "@/components/steve-note";

export const metadata: Metadata = {
  title: "Employment Damages Estimator",
  description:
    "Estimate employment damages including back pay, front pay, benefits, liquidated damages, and more.",
  alternates: { canonical: "/tools/employment-damages-estimator" },
};

export default function EmploymentDamagesEstimatorPage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-medium text-brand-accent mb-1">
            Calculators
          </p>
          <h1 className="text-3xl font-bold text-brand-primary">
            Employment Damages Estimator
          </h1>
          <p className="mt-2 text-brand-muted max-w-2xl">
            Estimate potential employment damages. Enter values and press Enter or
            tab away to update the totals.
          </p>
        </div>
        <SteveNote note="This tool estimates a plaintiff's potential recovery in an employment case. Run a few scenarios to see what the numbers look like under different assumptions. You can run the back pay and mitigation figures to date or through trial. The other categories of damages are more subjective and uncertain, so test them a few ways, keeping in mind applicable caps on compensatory damages. Note, if the plaintiff is currently employed, those earnings are a setoff against any front pay award. The best case scenario is an unlikely outcome in litigation, but it can be a useful benchmark in negotiation." />
      </div>
      <EmploymentDamagesClient />
    </>
  );
}
