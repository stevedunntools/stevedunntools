import type { Metadata } from "next";
import SimpleInterestClient from "./client";

export const metadata: Metadata = {
  title: "Simple Interest Calculator | Steve Dunn Tools",
  description:
    "Calculate simple interest on any amount over any time period at any rate.",
};

export default function SimpleInterestCalculatorPage() {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-accent mb-1">
          Calculators
        </p>
        <h1 className="text-3xl font-bold text-brand-primary">
          Simple Interest Calculator
        </h1>
        <p className="mt-2 text-brand-muted max-w-2xl">
          Calculate simple interest on any principal amount. Enter values and
          press Enter or tab away to update.
        </p>
      </div>
      <SimpleInterestClient />
    </>
  );
}
