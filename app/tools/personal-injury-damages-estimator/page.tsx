import { toolMetadata } from "@/lib/tool-metadata";
import PersonalInjuryClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Personal Injury Damages Estimator",
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
        note="This uses the multiplier method to estimate personal injury damages. The multiplier (ranging from 1x to 5x) is applied to your total medical expenses — past and future combined — to estimate pain and suffering. It's a widely used approach, but keep in mind it's a starting point, not a final answer. The multiplier you choose should reflect the severity of the injury, the quality of the documentation, and the jurisdiction. Try running it at a few different multiplier levels to see the range of outcomes — that range is often more useful in a negotiation than any single number."
      />
      <PersonalInjuryClient />
    </>
  );
}
