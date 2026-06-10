import type { Metadata } from "next";
import BracketGeneratorClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata: Metadata = {
  title: "Bracket Generator",
  description:
    "Generate a bracketed offer range by entering any two of our number, their number, and midpoint.",
  alternates: { canonical: "/tools/bracket-generator" },
};

export default function BracketGeneratorPage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/bracket-generator"
        title="Bracket Generator"
        description="Enter any two of the three values and the third will calculate automatically. Changing an endpoint recalculates the midpoint. Changing the midpoint shifts both endpoints by equal amounts, keeping the spread the same."
        note="How many lawyers does it take to do simple arithmetic? Brackets are tricky enough as it is – this tool takes the guesswork out of the math. Enter any two of three values — our number, their number, or midpoint — and this fills in the third. Use this to quickly test different bracket positions and see how the midpoint shifts."
      />
      <BracketGeneratorClient />
    </>
  );
}
