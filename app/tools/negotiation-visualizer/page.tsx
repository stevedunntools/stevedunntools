import type { Metadata } from "next";
import NegotiationVisualizerClient from "./client";
import SteveNote from "@/components/steve-note";

export const metadata: Metadata = {
  title: "Negotiation Visualizer",
  description:
    "Visualize the negotiation process with an interactive chart of offers, counteroffers, and convergence patterns.",
  alternates: { canonical: "/tools/negotiation-visualizer" },
};

export default function NegotiationVisualizerPage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 print:hidden">
        <div>
          <p className="text-sm font-medium text-brand-accent mb-1">
            Negotiation Tools
          </p>
          <h1 className="text-3xl font-bold text-brand-primary">
            Negotiation Visualizer
          </h1>
          <p className="mt-2 text-brand-muted max-w-2xl">
            Chart offers and brackets from both parties to visualize convergence.
            Numerical offers appear as connected dots; brackets appear as shaded
            ranges. Overlapping bracket zones are highlighted in green.
          </p>
        </div>
        <SteveNote note="This tool charts your negotiation as it unfolds, round by round. Enter numerical offers as single numbers or brackets as ranges (like 200,000-400,000). The chart shows brackets as shaded areas with a dotted line to the midpoint. The area where brackets overlap is shown in green. When the negotiation is done, you can export the chart and offer history for your file." />
      </div>
      <NegotiationVisualizerClient />
    </>
  );
}
