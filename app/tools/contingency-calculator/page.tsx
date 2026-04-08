import type { Metadata } from "next";
import ContingencyCalculatorClient from "./client";

export const metadata: Metadata = {
  title: "Contingency Calculator",
  description:
    "Calculate attorney fees under a contingency arrangement and the net recovery to the plaintiff.",
  alternates: { canonical: "/tools/contingency-calculator" },
};

export default function ContingencyCalculatorPage() {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-accent mb-1">
          Calculators
        </p>
        <h1 className="text-3xl font-bold text-brand-primary">
          Contingency Calculator
        </h1>
        <p className="mt-2 text-brand-muted max-w-2xl">
          Calculate attorney fees and the plaintiff&apos;s net recovery under a
          contingency fee arrangement. Enter values and press Enter or tab away
          to update.
        </p>
      </div>
      <ContingencyCalculatorClient />
    </>
  );
}
