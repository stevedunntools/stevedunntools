import { toolMetadata } from "@/lib/tool-metadata";
import TakeHomeAfterTaxesClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Rough Guess After Taxes Estimator",
  seoTitle: "Rough Guess After Taxes — Settlement Tax Estimator",
  description:
    "Estimate take-home pay after federal and state taxes for W-2 wages, 1099 income, and tax-free personal injury proceeds. 2026 tax year.",
  path: "/tools/take-home-after-taxes",
});

export default function TakeHomeAfterTaxesPage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/take-home-after-taxes"
        title="Rough Guess After Taxes Estimator"
        description="Enter wages, 1099 income, and any tax-free personal injury proceeds to see an estimate of after-tax take-home pay for tax year 2026. Useful for modeling settlement allocations."
        note="As the name says, this is a rough guess — only a tax professional looking at a complete return can tell you what you'll actually owe. But in a negotiation, a rough guess beats no guess. Use it to compare how different allocations of a settlement — wages, 1099 income, or tax-free personal injury proceeds — change what actually ends up in the client's pocket. Read the disclaimer for everything this estimator does not account for."
      />
      <TakeHomeAfterTaxesClient />
    </>
  );
}
