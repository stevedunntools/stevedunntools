import type { Metadata } from "next";
import PaymentOverTimeClient from "./client";
import SteveNote from "@/components/steve-note";

export const metadata: Metadata = {
  title: "Payment Over Time Calculator",
  description:
    "Build a complete payment schedule for settlements paid in installments with interest.",
  alternates: { canonical: "/tools/payment-over-time" },
};

export default function PaymentOverTimePage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 print:hidden">
        <div>
          <p className="text-sm font-medium text-brand-accent mb-1">
            Calculators
          </p>
          <h1 className="text-3xl font-bold text-brand-primary">
            Payment Over Time Calculator
          </h1>
          <p className="mt-2 text-brand-muted max-w-2xl">
            Build a complete payment schedule for a settlement paid with up-front
            payments and installments. Enter values and press Enter or tab away to
            update.
          </p>
        </div>
        <SteveNote note="This tool designs a settlement payment schedule with upfront payments, installments, and optional interest. A few things to know: it uses standard amortization formulas, not simple interest, so each payment includes a declining interest component and an increasing principal component. You can calculate in two directions — fix the number of payments to find the amount, or fix the amount to find how many payments are needed." />
      </div>
      <PaymentOverTimeClient />
    </>
  );
}
