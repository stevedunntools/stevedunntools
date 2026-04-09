import type { Metadata } from "next";
import ConvergenceCalculatorClient from "./client";
import SteveNote from "@/components/steve-note";

export const metadata: Metadata = {
  title: "Convergence Visualizer",
  description:
    "Enter two offers from each party to project where their trends would intersect.",
  alternates: { canonical: "/tools/convergence-calculator" },
};

export default function ConvergenceCalculatorPage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
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
        <SteveNote note="If the pattern continues, where will we meet? This tool provides a simple answer. Enter one move from each side and the tool will tell you where the numbers will end up and how long it will take to get there. Negotiations rarely proceed in lockstep moves from start to finish, but this tool can help you decide whether to continue a pattern at least for a while." />
      </div>
      <ConvergenceCalculatorClient />
    </>
  );
}
