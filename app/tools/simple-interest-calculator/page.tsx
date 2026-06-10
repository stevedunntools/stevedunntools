import type { Metadata } from "next";
import SimpleInterestClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata: Metadata = {
  title: "Simple Interest Calculator",
  description:
    "Calculate simple interest on any amount over any time period at any rate.",
  alternates: { canonical: "/tools/simple-interest-calculator" },
};

export default function SimpleInterestCalculatorPage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/simple-interest-calculator"
        title="Simple Interest Calculator"
        description="Calculate simple interest on any principal amount over any time period."
        note="This calculates simple (non-compounding) interest on any principal amount over any period of time. It uses a 365-day year, not the 360-day convention some courts and financial institutions use — so if your jurisdiction uses a 360-day year, the numbers here will be slightly different. You can enter time in days, months, or years."
      />
      <SimpleInterestClient />
    </>
  );
}
