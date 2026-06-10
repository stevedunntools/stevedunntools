"use client";

import { useSessionState, clearSessionKeys } from "@/lib/use-session-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { fmt, parseNum } from "@/lib/format";
import { Row, Separator } from "@/components/breakdown-table";
import DollarInput from "@/components/dollar-input";
import PercentSlider from "@/components/percent-slider";
import EstimateDisclaimer from "@/components/estimate-disclaimer";
import ExportPdfButton from "@/components/export-pdf-button";
import MobileResultBar from "@/components/mobile-result-bar";

export default function DefendantsExpectedCostClient() {
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

  const dmg = parseNum(damages);
  const pFees = parseNum(plaintiffFees);
  const dFees = parseNum(defendantFees);
  const dCosts = parseNum(defendantCosts);
  const intang = parseNum(intangibleCosts);

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
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Damages amount
              </label>
              <DollarInput
                value={damages}
                onChange={setDamages}
                placeholder="250,000"
              />
            </div>
            <PercentSlider
              value={damagesProbability}
              onChange={setDamagesProbability}
              min={1}
              max={100}
              label="Probability of plaintiff prevailing on damages"
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
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Plaintiff&apos;s fees &amp; costs
              </label>
              <DollarInput
                value={plaintiffFees}
                onChange={setPlaintiffFees}
                placeholder="75,000"
              />
            </div>
            <PercentSlider
              value={feeProbability}
              onChange={setFeeProbability}
              min={1}
              max={100}
              label="Probability of fee shifting — use the same percentage as above if fee shifting is presumed"
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
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Defendant&apos;s attorneys fees
              </label>
              <DollarInput
                value={defendantFees}
                onChange={setDefendantFees}
                placeholder="100,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Defendant&apos;s litigation costs
              </label>
              <DollarInput
                value={defendantCosts}
                onChange={setDefendantCosts}
                placeholder="25,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Intangible costs
              </label>
              <DollarInput
                value={intangibleCosts}
                onChange={setIntangibleCosts}
                placeholder="10,000"
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

      {/* Results */}
      <div className="lg:col-span-2">
        <div className="sticky top-20 space-y-6">
          <Card id="tool-headline-result" className="bg-white border-brand-accent">
            <CardContent className="pt-6">
              <p className="text-sm text-brand-muted mb-1">Defendant&apos;s Total Expected Cost</p>
              <p className="text-3xl font-bold text-brand-accent">
                {fmt(totalExpectedCost)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-brand-border">
            <CardHeader>
              <CardTitle className="text-brand-primary text-base">Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <tbody>
                  <Row label="Plaintiff's damages" value={dmg} />
                  <Row label="Probability" value={`${damagesProbability}%`} />
                  <Row label="Expected damages" value={expectedDamages} bold />
                  <Separator />
                  <Row label="Plaintiff's fees & costs" value={pFees} />
                  <Row label="Fee shifting probability" value={`${feeProbability}%`} />
                  <Row label="Expected fee exposure" value={expectedFeeExposure} bold />
                  <Separator />
                  <Row label="Defendant's attorneys fees" value={dFees} />
                  <Row label="Defendant's litigation costs" value={dCosts} />
                  <Row label="Intangible costs" value={intang} />
                  <Separator />
                  <tr>
                    <td className="py-2 font-semibold text-brand-primary">Total expected cost</td>
                    <td className="py-2 text-right font-semibold text-brand-accent">
                      {fmt(totalExpectedCost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          <EstimateDisclaimer />
          <div className="print:hidden">
            <ExportPdfButton />
          </div>
        </div>
      </div>
      <MobileResultBar label="Expected cost" value={fmt(totalExpectedCost)} targetId="tool-headline-result" />
    </div>
  );
}
