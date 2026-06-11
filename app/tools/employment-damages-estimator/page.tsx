import { toolMetadata } from "@/lib/tool-metadata";
import EmploymentDamagesClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Employment Damages Estimator",
  description:
    "Estimate employment damages including back pay, front pay, benefits, liquidated damages, and more.",
  path: "/tools/employment-damages-estimator",
});

export default function EmploymentDamagesEstimatorPage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/employment-damages-estimator"
        title="Employment Damages Estimator"
        description="Estimate potential employment damages including back pay, mitigation, front pay, and additional damages."
        note="This tool estimates a plaintiff's potential recovery in an employment case. Run a few scenarios to see what the numbers look like under different assumptions. You can run the back pay and mitigation figures to date or through trial. The other categories of damages are more subjective and uncertain, so test them a few ways, keeping in mind applicable caps on compensatory damages. Note, if the plaintiff is currently employed, those earnings are a setoff against any front pay award. The best case scenario is an unlikely outcome in litigation, but it can be a useful benchmark in negotiation."
      />
      <EmploymentDamagesClient />
    </>
  );
}
