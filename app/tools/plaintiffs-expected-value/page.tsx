import type { Metadata } from "next";
import PlaintiffsExpectedValueClient from "./client";
import SteveNote from "@/components/steve-note";

export const metadata: Metadata = {
  title: "Plaintiff's Expected Value",
  description:
    "Calculate the probability-weighted expected value of a plaintiff's case, adjusted for costs and the time value of money.",
  alternates: { canonical: "/tools/plaintiffs-expected-value" },
};

export default function PlaintiffsExpectedValuePage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-medium text-brand-accent mb-1">
            Calculators
          </p>
          <h1 className="text-3xl font-bold text-brand-primary">
            Plaintiff&apos;s Expected Value
          </h1>
          <p className="mt-2 text-brand-muted max-w-2xl">
            Calculate the expected value of a case adjusted for probability of
            success and time value of money, less fees and costs.
          </p>
        </div>
        <SteveNote note="This tool suggests one way of thinking about the value of a claim by adjusting for three things: the probability of winning, the time value of money, and the costs of getting there. The discount rate reflects that a dollar today is worth more than a dollar several months or years from now after trial. Costs include not just attorney fees and litigation expenses but also intangible costs like stress, lost time, and reputational risk – don't underestimate these costs! Test your assumptions a few ways to develop a sense of what the claim is worth, remembering there are no sure things in litigation and most litigants tend to be overly optimistic about their chances." />
      </div>
      <PlaintiffsExpectedValueClient />
    </>
  );
}
