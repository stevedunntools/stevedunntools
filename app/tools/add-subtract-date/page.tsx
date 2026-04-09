import type { Metadata } from "next";
import AddSubtractDateClient from "./client";
import SteveNote from "@/components/steve-note";

export const metadata: Metadata = {
  title: "Add/Subtract from Date",
  description:
    "Add or subtract years, months, weeks, and days from a date, with business day support.",
  alternates: { canonical: "/tools/add-subtract-date" },
};

export default function AddSubtractDatePage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-medium text-brand-accent mb-1">
            Calculators
          </p>
          <h1 className="text-3xl font-bold text-brand-primary">
            Add/Subtract from Date
          </h1>
          <p className="mt-2 text-brand-muted max-w-2xl">
            Add or subtract years, months, weeks, and/or days from a date. Enable
            business days to skip weekends and federal holidays.
          </p>
        </div>
        <SteveNote note="Add or subtract any combination of years, months, weeks, and days from a date. The business days option counts only weekdays, and you can optionally exclude federal holidays too. One subtlety: years, months, and weeks are always calendar-based, even when business days mode is on." />
      </div>
      <AddSubtractDateClient />
    </>
  );
}
