import type { Metadata } from "next";
import DaysBetweenDatesClient from "./client";

export const metadata: Metadata = {
  title: "Days Between Dates",
  description:
    "Calculate the number of years, months, weeks, and days between two dates.",
  alternates: { canonical: "/tools/days-between-dates" },
};

export default function DaysBetweenDatesPage() {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-accent mb-1">
          Calculators
        </p>
        <h1 className="text-3xl font-bold text-brand-primary">
          Days Between Dates
        </h1>
        <p className="mt-2 text-brand-muted max-w-2xl">
          Calculate the duration between two dates, expressed in multiple
          formats.
        </p>
      </div>
      <DaysBetweenDatesClient />
    </>
  );
}
