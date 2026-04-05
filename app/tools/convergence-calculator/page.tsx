import type { Metadata } from "next";
import ConvergenceCalculatorClient from "./client";

export const metadata: Metadata = {
  title: "Convergence Visualizer | Steve Dunn Tools",
  description:
    "Enter two offers from each party to project where their trends would intersect.",
};

export default function ConvergenceCalculatorPage() {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-accent mb-1">
          Negotiation Tools
        </p>
        <h1 className="text-3xl font-bold text-brand-primary">
          Convergence Visualizer
        </h1>
        <p className="mt-2 text-brand-muted max-w-2xl">
          Enter two offers from each party. The tool extrapolates both trends
          and projects where they would intersect if the pattern continued.
        </p>
      </div>
      <ConvergenceCalculatorClient />
    </>
  );
}
