import { toolPageMetadata } from "@/lib/tool-metadata";
import ToolPage from "@/components/tool-page";
import PaymentOverTimeClient from "./client";

export const metadata = toolPageMetadata("payment-over-time");

export default function Page() {
  return (
    <ToolPage slug="payment-over-time">
      <PaymentOverTimeClient />
    </ToolPage>
  );
}
