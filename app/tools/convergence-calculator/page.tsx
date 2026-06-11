import { toolMetadata } from "@/lib/tool-metadata";
import ConvergenceCalculatorClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Point of Intersection",
  seoTitle: "Point of Intersection — Negotiation Convergence Calculator",
  description:
    "Enter two offers from each party. The tool shows where the lines would intersect if the pattern continued.",
  path: "/tools/convergence-calculator",
});

export default function ConvergenceCalculatorPage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/convergence-calculator"
        title="Point of Intersection"
        description="Enter two offers from each party. The tool shows where the lines would intersect if the pattern continued."
        note="If the pattern continues, where will we meet? This tool provides a simple answer. Enter one move from each side and the tool will tell you where the numbers will end up and how long it will take to get there. Negotiations rarely proceed in lockstep moves from start to finish, but this tool can help you decide whether to continue a pattern at least for a while."
      />
      <ConvergenceCalculatorClient />
    </>
  );
}
