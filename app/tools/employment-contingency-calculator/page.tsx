import type { Metadata } from "next";
import EmploymentContingencyClient from "./client";
import SteveNote from "@/components/steve-note";

export const metadata: Metadata = {
  title: "Employment Contingency Calculator",
  description:
    "Calculate attorney fees, net recovery, and wage vs. non-wage allocation for employment settlements.",
  alternates: { canonical: "/tools/employment-contingency-calculator" },
};

export default function EmploymentContingencyCalculatorPage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
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
        <SteveNote note="This works like a standard contingency calculator but adds a critical step for employment cases: splitting the plaintiff's net recovery into wages and non-wage income. That allocation matters for tax reporting — back wages are subject to payroll and income tax, while compensatory damages for emotional distress or other non-wage claims may not be." />
      </div>
      <EmploymentContingencyClient />
    </>
  );
}
