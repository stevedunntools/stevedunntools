import { toolMetadata } from "@/lib/tool-metadata";
import PaymentOverTimeClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Payment Over Time Calculator",
  description:
    "Build a complete payment schedule for settlements paid in installments with interest.",
  path: "/tools/payment-over-time",
});

export default function PaymentOverTimePage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/payment-over-time"
        title="Payment Over Time Calculator"
        description="Build a complete payment schedule for a settlement paid with up-front payments and installments."
        note="This tool designs a settlement payment schedule with upfront payments, installments, and optional interest. A few things to know: it uses standard amortization formulas, not simple interest, so each payment includes a declining interest component and an increasing principal component. You can calculate in two directions — fix the number of payments to find the amount, or fix the amount to find how many payments are needed."
      />
      <PaymentOverTimeClient />
    </>
  );
}
