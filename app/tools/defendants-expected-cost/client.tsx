"use client";

import PrintInputs from "@/components/print-inputs";
import { useSessionState, clearSessionKeys, useHydrated } from "@/lib/use-session-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { fmt, parseNumNonNeg } from "@/lib/format";
import { Row, Separator, TotalRow } from "@/components/breakdown-table";
import DollarInput from "@/components/dollar-input";
import PercentSlider from "@/components/percent-slider";
import ResultsShell from "@/components/results-shell";
import MobileResultBar from "@/components/mobile-result-bar";

export default function DefendantsExpectedCostClient() {
  const hydrated = useHydrated();
  const [damages, setDamages] = useSessionState("tool:defendant-ec:damages", "");
  const [damagesProbability, setDamagesProbability] = useSessionState("tool:defendant-ec:damagesProbability", 100);
  const [plaintiffFees, setPlaintiffFees] = useSessionState("tool:defendant-ec:plaintiffFees", "");
  const [feeProbability, setFeeProbability] = useSessionState("tool:defendant-ec:feeProbability", 100);
  const [defendantFees, setDefendantFees] = useSessionState("tool:defendant-ec:defendantFees", "");
  const [defendantCosts, setDefendantCosts] = useSessionState("tool:defendant-ec:defendantCosts", "");
  const [intangibleCosts, setIntangibleCosts] = useSessionState("tool:defendant-ec:intangibleCosts", "");

  function clearAll() {
    setDamages("");
    setDamagesProbability(100);
    setPlaintiffFees("");
    setFeeProbability(100);
    setDefendantFees("");
    setDefendantCosts("");
    setIntangibleCosts("");
    clearSessionKeys("tool:defendant-ec:");
  }

  const dmg = parseNumNonNeg(damages);
  const pFees = parseNumNonNeg(plaintiffFees);
  const dFees = parseNumNonNeg(defendantFees);
  const dCosts = parseNumNonNeg(defendantCosts);
  const intang = parseNumNonNeg(intangibleCosts);

  const expectedDamages = dmg * (damagesProbability / 100);
  const expectedFeeExposure = pFees * (feeProbability / 100);
  const totalExpectedCost = expectedDamages + expectedFeeExposure + dFees + dCosts + intang;

  const hasAny =
    damages !== "" ||
    plaintiffFees !== "" ||
    defendantFees !== "" ||
    defendantCosts !== "" ||
    intangibleCosts !== "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6 print:hidden">
        {/* Plaintiff's Damages */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Plaintiff&apos;s Damages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-[calc(50%-0.5rem)]">
              <label
                htmlFor="defendant-ec-damages"
                className="block text-sm font-medium text-brand-primary mb-1.5"
              >
                Damages amount
              </label>
              <DollarInput
                id="defendant-ec-damages"
                value={damages}
                onChange={setDamages}
                placeholder="e.g. 250,000"
              />
            </div>
            <PercentSlider
              value={damagesProbability}
              onChange={setDamagesProbability}
              min={1}
              max={100}
              label="Probability of plaintiff prevailing on damages"
              aria-label="Probability of plaintiff prevailing on damages"
            />
          </CardContent>
        </Card>

        {/* Plaintiff's Costs & Fees */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Plaintiff&apos;s Costs &amp; Attorneys&apos; Fees (if recoverable)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-[calc(50%-0.5rem)]">
              <label
                htmlFor="defendant-ec-plaintiff-fees"
                className="block text-sm font-medium text-brand-primary mb-1.5"
              >
                Plaintiff&apos;s fees &amp; costs
              </label>
              <DollarInput
                id="defendant-ec-plaintiff-fees"
                value={plaintiffFees}
                onChange={setPlaintiffFees}
                placeholder="e.g. 75,000"
              />
            </div>
            <PercentSlider
              value={feeProbability}
              onChange={setFeeProbability}
              min={1}
              max={100}
              label="Probability of fee shifting — use the same percentage as above if fee shifting is presumed"
              aria-label="Probability of fee shifting"
            />
          </CardContent>
        </Card>

        {/* Defendant's Costs */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Defendant&apos;s Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="defendant-ec-attorneys-fees"
                className="block text-sm font-medium text-brand-primary mb-1.5"
              >
                Defendant&apos;s attorneys fees
              </label>
              <DollarInput
                id="defendant-ec-attorneys-fees"
                value={defendantFees}
                onChange={setDefendantFees}
                placeholder="e.g. 100,000"
              />
            </div>
            <div>
              <label
                htmlFor="defendant-ec-litigation-costs"
                className="block text-sm font-medium text-brand-primary mb-1.5"
              >
                Defendant&apos;s litigation costs
              </label>
              <DollarInput
                id="defendant-ec-litigation-costs"
                value={defendantCosts}
                onChange={setDefendantCosts}
                placeholder="e.g. 25,000"
              />
            </div>
            <div>
              <label
                htmlFor="defendant-ec-intangible-costs"
                className="block text-sm font-medium text-brand-primary mb-1.5"
              >
                Intangible costs
              </label>
              <DollarInput
                id="defendant-ec-intangible-costs"
                value={intangibleCosts}
                onChange={setIntangibleCosts}
                placeholder="e.g. 10,000"
              />
            </div>
          </CardContent>
        </Card>

        {hasAny && (
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </div>

      <PrintInputs items={[
        { label: "Potential damages", value: damages ? "$" + damages : "" },
        { label: "Probability of damages", value: `${damagesProbability}%` },
        { label: "Plaintiff's fees if shifted", value: plaintiffFees ? "$" + plaintiffFees : "" },
        { label: "Probability of fee award", value: `${feeProbability}%` },
        { label: "Defense fees", value: defendantFees ? "$" + defendantFees : "" },
        { label: "Defense costs", value: defendantCosts ? "$" + defendantCosts : "" },
        { label: "Intangible costs", value: intangibleCosts ? "$" + intangibleCosts : "" },
      ]} />
      {/* Results */}
      <div className="lg:col-span-2">
        <ResultsShell
          label="Defendant&apos;s Total Expected Cost"
          value={hydrated && hasAny ? fmt(totalExpectedCost) : "—"}
        >
          <Card className="bg-white border-brand-border">
            <CardHeader>
              <CardTitle className="text-brand-primary text-base">Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <tbody>
                  <Row label="Plaintiff's damages" value={hydrated && hasAny ? dmg : "—"} />
                  <Row label="Probability" value={hydrated && hasAny ? `${damagesProbability}%` : "—"} />
                  <Row label="Expected damages" value={hydrated && hasAny ? expectedDamages : "—"} bold />
                  <Separator />
                  <Row label="Plaintiff's fees & costs" value={hydrated && hasAny ? pFees : "—"} />
                  <Row label="Fee shifting probability" value={hydrated && hasAny ? `${feeProbability}%` : "—"} />
                  <Row label="Expected fee exposure" value={hydrated && hasAny ? expectedFeeExposure : "—"} bold />
                  <Separator />
                  <Row label="Defendant's attorneys fees" value={hydrated && hasAny ? dFees : "—"} />
                  <Row label="Defendant's litigation costs" value={hydrated && hasAny ? dCosts : "—"} />
                  <Row label="Intangible costs" value={hydrated && hasAny ? intang : "—"} />
                  <Separator />
                  <TotalRow
                    label="Total expected cost"
                    value={hydrated && hasAny ? fmt(totalExpectedCost) : "—"}
                  />
                </tbody>
              </table>
            </CardContent>
          </Card>
        </ResultsShell>
      </div>
      <MobileResultBar label="Expected cost" value={hydrated && hasAny ? fmt(totalExpectedCost) : "—"} />
    </div>
  );
}
