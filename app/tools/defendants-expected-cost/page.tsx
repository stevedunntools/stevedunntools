import { toolMetadata } from "@/lib/tool-metadata";
import DefendantsExpectedCostClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Defendant's Expected Cost",
  description:
    "Estimate the defendant's total expected cost including liability risk, damages exposure, and defense costs.",
  path: "/tools/defendants-expected-cost",
});

export default function DefendantsExpectedCostPage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/defendants-expected-cost"
        title="Defendant's Expected Cost"
        description="Estimate the defendant's total expected cost of litigation, including probability-adjusted damages and fee exposure, plus defense costs."
        note="This tool estimates the cost of litigation based on the probability-weighted exposure on damages, the risk of fee-shifting, and the defendant's certain expenses — attorney fees, costs, and intangibles. For a complete picture, run the numbers a few ways: a best case scenario, worst case scenario, and something in between."
      />
      <DefendantsExpectedCostClient />
    </>
  );
}
