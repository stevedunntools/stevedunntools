import { toolMetadata } from "@/lib/tool-metadata";
import SimpleInterestClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";
import ToolPageFooter from "@/components/tool-page-footer";

export const metadata = toolMetadata({
  title: "Simple Interest Calculator",
  description:
    "Calculate simple interest on any amount over any time period at any rate.",
  path: "/tools/simple-interest-calculator",
});

export default function SimpleInterestCalculatorPage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/simple-interest-calculator"
        title="Simple Interest Calculator"
        description="Calculate simple interest on any principal amount over any time period."
      />
      <SimpleInterestClient />
      <ToolPageFooter href="/tools/simple-interest-calculator" />
    </>
  );
}
