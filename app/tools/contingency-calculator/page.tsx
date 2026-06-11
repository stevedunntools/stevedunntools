import { toolMetadata } from "@/lib/tool-metadata";
import ContingencyCalculatorClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Contingency Calculator",
  description:
    "Calculate attorney fees under a contingency arrangement and the net recovery to the plaintiff.",
  path: "/tools/contingency-calculator",
});

export default function ContingencyCalculatorPage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/contingency-calculator"
        title="Contingency Calculator"
        description="Calculate attorney fees and the plaintiff's net recovery under a contingency fee arrangement."
        note="A straightforward split: enter the settlement amount, your contingency percentage, and litigation costs, and see how the money divides between attorney and client."
      />
      <ContingencyCalculatorClient />
    </>
  );
}
