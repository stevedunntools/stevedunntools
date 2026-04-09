import type { Metadata } from "next";
import SimpleInterestClient from "./client";
import SteveNote from "@/components/steve-note";

export const metadata: Metadata = {
  title: "Simple Interest Calculator",
  description:
    "Calculate simple interest on any amount over any time period at any rate.",
  alternates: { canonical: "/tools/simple-interest-calculator" },
};

export default function SimpleInterestCalculatorPage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
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
        <SteveNote note="This calculates simple (non-compounding) interest on any principal amount over any period of time. It uses a 365-day year, not the 360-day convention some courts and financial institutions use — so if your jurisdiction uses a 360-day year, the numbers here will be slightly different. You can enter time in days, months, or years." />
      </div>
      <SimpleInterestClient />
    </>
  );
}
