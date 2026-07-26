import { toolMetadata } from "@/lib/tool-metadata";
import PersonalInjuryClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Personal Injury Damages Estimator",
  seoTitle: "Personal Injury Settlement Calculator",
  description:
    "Estimate personal injury damages including medical expenses, lost earnings, property damage, and non-economic damages.",
  path: "/tools/personal-injury-damages-estimator",
});

export default function PersonalInjuryDamagesEstimatorPage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/personal-injury-damages-estimator"
        title="Personal Injury Damages Estimator"
        description="Estimate personal injury damages. The non-economic damages multiplier applies to total medical expenses."
      />
      <PersonalInjuryClient />
    </>
  );
}
