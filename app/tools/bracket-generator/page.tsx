import type { Metadata } from "next";
import BracketGeneratorClient from "./client";

export const metadata: Metadata = {
  title: "Bracket Generator | Steve Dunn Tools",
  description:
    "Generate a bracketed offer range by entering any two of upper, lower, and midpoint.",
};

export default function BracketGeneratorPage() {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-accent mb-1">
          Negotiation Tools
        </p>
        <h1 className="text-3xl font-bold text-brand-primary">
          Bracket Generator
        </h1>
        <p className="mt-2 text-brand-muted max-w-2xl">
          Enter any two of the three values and the third will calculate
          automatically. Changing the upper or lower value recalculates the
          midpoint. Changing the midpoint shifts the upper and lower values
          by equal amounts, keeping the spread the same.
        </p>
      </div>
      <BracketGeneratorClient />
    </>
  );
}
