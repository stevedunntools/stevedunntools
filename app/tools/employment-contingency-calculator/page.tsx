import type { Metadata } from "next";
import EmploymentContingencyClient from "./client";

export const metadata: Metadata = {
  title: "Employment Contingency Calculator | Steve Dunn Tools",
  description:
    "Calculate attorney fees, net recovery, and wage vs. non-wage allocation for employment settlements.",
};

export default function EmploymentContingencyCalculatorPage() {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-accent mb-1">
          Calculators
        </p>
        <h1 className="text-3xl font-bold text-brand-primary">
          Employment Contingency Calculator
        </h1>
        <p className="mt-2 text-brand-muted max-w-2xl">
          Calculate the plaintiff&apos;s net recovery under a contingency fee
          arrangement, with allocation between wages and non-wage income for tax
          purposes. Enter values and press Enter or tab away to update.
        </p>
      </div>
      <EmploymentContingencyClient />
    </>
  );
}
