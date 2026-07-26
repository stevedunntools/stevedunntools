import { toolMetadata } from "@/lib/tool-metadata";
import BracketGeneratorClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Bracket Generator",
  seoTitle: "Settlement Bracket Calculator",
  description:
    "Generate a bracketed offer range by entering any two of our number, their number, and midpoint.",
  path: "/tools/bracket-generator",
});

export default function BracketGeneratorPage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/bracket-generator"
        title="Bracket Generator"
        description="Enter any two of the three values and the third will calculate automatically. Changing an endpoint recalculates the midpoint. Changing the midpoint shifts both endpoints by equal amounts, keeping the spread the same."
      />
      <BracketGeneratorClient />
    </>
  );
}
