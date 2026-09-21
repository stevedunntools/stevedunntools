import { toolMetadata } from "@/lib/tool-metadata";
import PaymentOverTimeClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";
import ToolPageFooter from "@/components/tool-page-footer";

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
      />
      <PaymentOverTimeClient />
      <ToolPageFooter href="/tools/payment-over-time" />
    </>
  );
}
