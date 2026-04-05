import type { Metadata } from "next";
import NegotiationVisualizerClient from "./client";

export const metadata: Metadata = {
  title: "Negotiation Visualizer | Steve Dunn Tools",
  description:
    "Visualize the negotiation process with an interactive chart of offers, counteroffers, and convergence patterns.",
};

export default function NegotiationVisualizerPage() {
  return (
    <>
      <div className="mb-8 print:hidden">
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
      <NegotiationVisualizerClient />
    </>
  );
}
