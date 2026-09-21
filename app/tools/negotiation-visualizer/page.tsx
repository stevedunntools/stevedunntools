import { toolMetadata } from "@/lib/tool-metadata";
import NegotiationVisualizerClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";
import ToolPageFooter from "@/components/tool-page-footer";

export const metadata = toolMetadata({
  title: "Negotiation Visualizer",
  seoTitle: "Settlement Negotiation Visualizer",
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
      />
      <NegotiationVisualizerClient />
      <ToolPageFooter href="/tools/negotiation-visualizer" />
    </>
  );
}
