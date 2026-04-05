import type { Metadata } from "next";
import PlaintiffsExpectedValueClient from "./client";

export const metadata: Metadata = {
  title: "Plaintiff's Expected Value | Steve Dunn Tools",
  description:
    "Calculate the probability-weighted expected value of a plaintiff's case, adjusted for costs and the time value of money.",
};

export default function PlaintiffsExpectedValuePage() {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-accent mb-1">
          Calculators
        </p>
        <h1 className="text-3xl font-bold text-brand-primary">
          Plaintiff&apos;s Expected Value
        </h1>
        <p className="mt-2 text-brand-muted max-w-2xl">
          Calculate the expected value of a case adjusted for probability of
          success and time value of money, less fees and costs.
        </p>
      </div>
      <PlaintiffsExpectedValueClient />
    </>
  );
}
