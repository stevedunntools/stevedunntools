import type { Metadata } from "next";
import EmploymentDamagesClient from "./client";

export const metadata: Metadata = {
  title: "Employment Damages Estimator",
  description:
    "Estimate employment damages including back pay, front pay, benefits, liquidated damages, and more.",
  alternates: { canonical: "/tools/employment-damages-estimator" },
};

export default function EmploymentDamagesEstimatorPage() {
  return (
    <>
      <div className="mb-8">
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
      <EmploymentDamagesClient />
    </>
  );
}
