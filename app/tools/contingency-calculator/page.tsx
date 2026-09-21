import { toolMetadata } from "@/lib/tool-metadata";
import ContingencyCalculatorClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";
import ToolPageFooter from "@/components/tool-page-footer";

export const metadata = toolMetadata({
  title: "Contingency Calculator",
  seoTitle: "Contingency Fee Calculator",
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
      />
      <ContingencyCalculatorClient />
      <ToolPageFooter href="/tools/contingency-calculator" />
    </>
  );
}
