import type { Metadata } from "next";
import DaysBetweenDatesClient from "./client";
import SteveNote from "@/components/steve-note";

export const metadata: Metadata = {
  title: "Days Between Dates",
  description:
    "Calculate the number of years, months, weeks, and days between two dates.",
  alternates: { canonical: "/tools/days-between-dates" },
};

export default function DaysBetweenDatesPage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
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
        <SteveNote note="This tool counts the exact number of days between two dates and breaks it down in several formats: years/months/days, total months, weeks, and total days. The &quot;include end day&quot; option adds one day to the count — use it when both the start and end dates should be counted, which is common in statutory deadline calculations." />
      </div>
      <DaysBetweenDatesClient />
    </>
  );
}
