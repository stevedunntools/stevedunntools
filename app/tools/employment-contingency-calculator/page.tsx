import { toolMetadata } from "@/lib/tool-metadata";
import EmploymentContingencyClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";
import ToolPageFooter from "@/components/tool-page-footer";

export const metadata = toolMetadata({
  title: "W-2, 1099, and Attorney Fee Calculator",
  seoTitle: "Employment Settlement Fee Calculator",
  description:
    "Calculate attorney fees, net recovery, and wage vs. non-wage allocation for employment settlements.",
  path: "/tools/employment-contingency-calculator",
});

export default function EmploymentContingencyCalculatorPage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/employment-contingency-calculator"
        title="W-2, 1099, and Attorney Fee Calculator"
        description="Calculate the plaintiff's net recovery under a contingency fee arrangement, with allocation between wages and non-wage income for tax purposes."
      />
      <EmploymentContingencyClient />
      <ToolPageFooter href="/tools/employment-contingency-calculator" />
    </>
  );
}
