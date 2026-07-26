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
      />
      <EmploymentDamagesClient />
    </>
  );
}
