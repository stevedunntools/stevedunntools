import type { Metadata } from "next";
import PaymentOverTimeClient from "./client";

export const metadata: Metadata = {
  title: "Payment Over Time Calculator | Steve Dunn Tools",
  description:
    "Build a complete payment schedule for settlements paid in installments with interest.",
};

export default function PaymentOverTimePage() {
  return (
    <>
      <div className="mb-8">
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
      <PaymentOverTimeClient />
    </>
  );
}
