import { toolMetadata } from "@/lib/tool-metadata";
import PlaintiffsExpectedValueClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Plaintiff's Expected Value",
  description:
    "Calculate the probability-weighted expected value of a plaintiff's case, adjusted for costs and the time value of money.",
  path: "/tools/plaintiffs-expected-value",
});

export default function PlaintiffsExpectedValuePage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/plaintiffs-expected-value"
        title="Plaintiff's Expected Value"
        description="Calculate the expected value of a case adjusted for probability of success and time value of money, less fees and costs."
      />
      <PlaintiffsExpectedValueClient />
    </>
  );
}
