import { toolMetadata } from "@/lib/tool-metadata";
import ConvergenceCalculatorClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Point of Intersection",
  seoTitle: "Negotiation Convergence Calculator",
  description:
    "Enter two offers from each side and see where the negotiation would converge if the pattern continued — or what it takes to land on your target number.",
  path: "/tools/convergence-calculator",
});

export default function ConvergenceCalculatorPage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/convergence-calculator"
        title="Point of Intersection"
        description="Enter two offers from each party. The tool shows where the lines would intersect if the pattern continued. You may also enter a desired settlement number to see how the parties' moves would need to adjust to reach that result."
      />
      <ConvergenceCalculatorClient />
    </>
  );
}
