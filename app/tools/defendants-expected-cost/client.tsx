"use client";

import { useMemo } from "react";
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

export default function DefendantsExpectedCostClient() {
  const [damages, setDamages] = useSessionState("tool:defendant-ec:damages", "");
  const [damagesProbability, setDamagesProbability] = useSessionState("tool:defendant-ec:damagesProbability", 100);
  const [plaintiffFees, setPlaintiffFees] = useSessionState("tool:defendant-ec:plaintiffFees", "");
  const [feeProbability, setFeeProbability] = useSessionState("tool:defendant-ec:feeProbability", 100);
  const [defendantFees, setDefendantFees] = useSessionState("tool:defendant-ec:defendantFees", "");
  const [defendantCosts, setDefendantCosts] = useSessionState("tool:defendant-ec:defendantCosts", "");
  const [intangibleCosts, setIntangibleCosts] = useSessionState("tool:defendant-ec:intangibleCosts", "");

  const [committed, setCommitted] = useSessionState("tool:defendant-ec:committed", {
    damages: "",
    damagesProbability: 100,
    plaintiffFees: "",
    feeProbability: 100,
    defendantFees: "",
    defendantCosts: "",
    intangibleCosts: "",
  });

  function commit() {
    setCommitted({
      damages,
      damagesProbability,
      plaintiffFees,
      feeProbability,
      defendantFees,
      defendantCosts,
      intangibleCosts,
    });
  }

  function clearAll() {
    setDamages("");
    setDamagesProbability(100);
    setPlaintiffFees("");
    setFeeProbability(100);
    setDefendantFees("");
    setDefendantCosts("");
    setIntangibleCosts("");
    setCommitted({
      damages: "",
      damagesProbability: 100,
      plaintiffFees: "",
      feeProbability: 100,
      defendantFees: "",
      defendantCosts: "",
      intangibleCosts: "",
    });
    clearSessionKeys("tool:defendant-ec:");
  }

  const calc = useMemo(() => {
    const dmg = parseNum(committed.damages);
    const dmgProb = committed.damagesProbability / 100;
    const pFees = parseNum(committed.plaintiffFees);
    const feeProb = committed.feeProbability / 100;
    const dFees = parseNum(committed.defendantFees);
    const dCosts = parseNum(committed.defendantCosts);
    const intang = parseNum(committed.intangibleCosts);

    const expectedDamages = dmg * dmgProb;
    const expectedFeeExposure = pFees * feeProb;
    const totalExpectedCost = expectedDamages + expectedFeeExposure + dFees + dCosts + intang;

    return {
      damages: dmg,
      damagesProbability: committed.damagesProbability,
      expectedDamages,
      plaintiffFees: pFees,
      feeProbability: committed.feeProbability,
      expectedFeeExposure,
      defendantFees: dFees,
      defendantCosts: dCosts,
      intangibleCosts: intang,
      totalExpectedCost,
    };
  }, [committed]);

  const hasAny =
    damages !== "" ||
    plaintiffFees !== "" ||
    defendantFees !== "" ||
    defendantCosts !== "" ||
    intangibleCosts !== "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6">
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
                onCommit={commit}
                placeholder="250,000"
              />
            </div>
            <PercentSlider
              value={damagesProbability}
              onChange={(val) => {
                setDamagesProbability(val);
                setCommitted((prev) => ({ ...prev, damagesProbability: val }));
              }}
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
                onCommit={commit}
                placeholder="75,000"
              />
            </div>
            <PercentSlider
              value={feeProbability}
              onChange={(val) => {
                setFeeProbability(val);
                setCommitted((prev) => ({ ...prev, feeProbability: val }));
              }}
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
                onCommit={commit}
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
                onCommit={commit}
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
                onCommit={commit}
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
          <Card className="bg-white border-brand-accent">
            <CardContent className="pt-6">
              <p className="text-sm text-brand-muted mb-1">Defendant&apos;s Total Expected Cost</p>
              <p className="text-3xl font-bold text-brand-accent">
                {fmt(calc.totalExpectedCost)}
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
                  <Row label="Plaintiff's damages" value={calc.damages} />
                  <Row label="Probability" value={`${calc.damagesProbability}%`} />
                  <Row label="Expected damages" value={calc.expectedDamages} bold />
                  <Separator />
                  <Row label="Plaintiff's fees & costs" value={calc.plaintiffFees} />
                  <Row label="Fee shifting probability" value={`${calc.feeProbability}%`} />
                  <Row label="Expected fee exposure" value={calc.expectedFeeExposure} bold />
                  <Separator />
                  <Row label="Defendant's attorneys fees" value={calc.defendantFees} />
                  <Row label="Defendant's litigation costs" value={calc.defendantCosts} />
                  <Row label="Intangible costs" value={calc.intangibleCosts} />
                  <Separator />
                  <tr>
                    <td className="py-2 font-semibold text-brand-primary">Total expected cost</td>
                    <td className="py-2 text-right font-semibold text-brand-accent">
                      {fmt(calc.totalExpectedCost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          <p className="text-xs text-brand-muted">
            This is an estimate for settlement discussion purposes only. It is
            not legal advice and does not account for all possible factors.
          </p>
        </div>
      </div>
    </div>
  );
}
