import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | Steve Dunn Tools",
  description:
    "Legal disclaimer for Steve Dunn Tools mediation calculators and utilities.",
};

export default function DisclaimerPage() {
  return (
    <div className="bg-brand-bg min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-brand-primary">Disclaimer</h1>

        <div className="mt-8 space-y-4 text-brand-muted leading-relaxed">
          <p>
            The tools and calculators on this website are provided for
            informational and educational purposes only. They are designed to
            assist lawyers, mediators, and parties in dispute resolution with
            settlement analysis and negotiation planning.
          </p>

          <h2 className="text-lg font-semibold text-brand-primary pt-2">
            Not Legal Advice
          </h2>
          <p>
            Nothing on this website constitutes legal advice. Use of these tools
            does not create an attorney-client relationship between you and
            Steve Dunn or any affiliated entity. You should consult with a
            qualified attorney before making any legal decisions based on the
            output of these tools.
          </p>

          <h2 className="text-lg font-semibold text-brand-primary pt-2">
            No Warranty
          </h2>
          <p>
            These tools are provided &ldquo;as is&rdquo; without warranty of
            any kind, express or implied, including but not limited to the
            warranties of accuracy, completeness, or fitness for a particular
            purpose. While we strive for accuracy, the calculations are
            estimates and may not reflect actual legal outcomes, damages awards,
            or settlement values.
          </p>

          <h2 className="text-lg font-semibold text-brand-primary pt-2">
            Assumption of Risk
          </h2>
          <p>
            You assume all risk associated with the use of these tools. Steve
            Dunn and Steve Dunn Tools shall not be liable for any damages,
            losses, or expenses arising from your use of or reliance on the
            information or calculations provided by this website.
          </p>

          <h2 className="text-lg font-semibold text-brand-primary pt-2">
            Estimates Only
          </h2>
          <p>
            All outputs are estimates intended to support settlement discussions
            and negotiation analysis. Actual results in any legal matter depend
            on facts, circumstances, applicable law, and other factors that
            these tools cannot account for. The tools are not a substitute for
            professional judgment.
          </p>
        </div>
      </div>
    </div>
  );
}
