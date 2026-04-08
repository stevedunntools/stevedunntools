import type { Metadata } from "next";
import AddSubtractDateClient from "./client";

export const metadata: Metadata = {
  title: "Add/Subtract from Date",
  description:
    "Add or subtract years, months, weeks, and days from a date, with business day support.",
  alternates: { canonical: "/tools/add-subtract-date" },
};

export default function AddSubtractDatePage() {
  return (
    <>
      <div className="mb-8">
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
      <AddSubtractDateClient />
    </>
  );
}
