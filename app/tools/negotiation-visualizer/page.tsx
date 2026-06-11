import { toolMetadata } from "@/lib/tool-metadata";
import NegotiationVisualizerClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Negotiation Visualizer",
  seoTitle: "Negotiation Visualizer — Settlement Offer Chart",
  description:
    "Visualize the negotiation process with an interactive chart of offers, counteroffers, and convergence patterns.",
  path: "/tools/negotiation-visualizer",
});

export default function NegotiationVisualizerPage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/negotiation-visualizer"
        title="Negotiation Visualizer"
        description="Chart offers and brackets from both parties to visualize convergence. Numerical offers appear as connected dots; brackets appear as shaded ranges. Overlapping bracket zones are highlighted in green."
        note="This tool charts your negotiation as it unfolds, round by round. Enter numerical offers as single numbers or brackets as ranges (like 200,000-400,000). The chart shows brackets as shaded areas with a dotted line to the midpoint. The area where brackets overlap is shown in green. When the negotiation is done, you can export the chart and offer history for your file."
      />
      <NegotiationVisualizerClient />
    </>
  );
}
