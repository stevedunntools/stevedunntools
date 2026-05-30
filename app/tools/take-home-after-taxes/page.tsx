import type { Metadata } from "next";
import TakeHomeAfterTaxesClient from "./client";

export const metadata: Metadata = {
  title: "Rough Guess After Taxes Estimator",
  description:
    "Estimate take-home pay after federal and state taxes for W-2 wages, 1099 income, and tax-free personal injury proceeds. 2026 tax year.",
  alternates: { canonical: "/tools/take-home-after-taxes" },
};

export default function TakeHomeAfterTaxesPage() {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-accent mb-1">Calculators</p>
        <h1 className="text-3xl font-bold text-brand-primary">
          Rough Guess After Taxes Estimator
        </h1>
        <p className="mt-2 text-brand-muted max-w-2xl">
          Enter wages, 1099 income, and any tax-free personal injury proceeds to
          see an estimate of after-tax take-home pay for tax year 2026. Useful for
          modeling settlement allocations.
        </p>
      </div>
      <TakeHomeAfterTaxesClient />
    </>
  );
}
