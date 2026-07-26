import { toolMetadata } from "@/lib/tool-metadata";
import TakeHomeAfterTaxesClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Rough Guess After Taxes Estimator",
  seoTitle: "Settlement Take-Home Pay After Taxes",
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
      />
      <TakeHomeAfterTaxesClient />
    </>
  );
}
