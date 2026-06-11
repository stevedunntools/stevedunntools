import { toolMetadata } from "@/lib/tool-metadata";
import EmploymentContingencyClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Employment Contingency Calculator",
  description:
    "Calculate attorney fees, net recovery, and wage vs. non-wage allocation for employment settlements.",
  path: "/tools/employment-contingency-calculator",
});

export default function EmploymentContingencyCalculatorPage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/employment-contingency-calculator"
        title="Employment Contingency Calculator"
        description="Calculate the plaintiff's net recovery under a contingency fee arrangement, with allocation between wages and non-wage income for tax purposes."
        note="This works like a standard contingency calculator but adds a critical step for employment cases: splitting the plaintiff's net recovery into wages and non-wage income. That allocation matters for tax reporting — back wages are subject to payroll and income tax, while compensatory damages for emotional distress or other non-wage claims may not be."
      />
      <EmploymentContingencyClient />
    </>
  );
}
