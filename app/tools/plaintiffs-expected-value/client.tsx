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
import { textFieldClass } from "@/lib/field-styles";

export default function PlaintiffsExpectedValueClient() {
  const [damages, setDamages] = useSessionState("tool:plaintiff-ev:damages", "");
  const [fees, setFees] = useSessionState("tool:plaintiff-ev:fees", "");
  const [litigationCosts, setLitigationCosts] = useSessionState("tool:plaintiff-ev:litigationCosts", "");
  const [intangibleCosts, setIntangibleCosts] = useSessionState("tool:plaintiff-ev:intangibleCosts", "");
  const [probability, setProbability] = useSessionState("tool:plaintiff-ev:probability", 100);
  const [yearsToPayment, setYearsToPayment] = useSessionState("tool:plaintiff-ev:yearsToPayment", "");
  const [discountRate, setDiscountRate] = useSessionState("tool:plaintiff-ev:discountRate", 4);

  function clearAll() {
    setDamages("");
    setFees("");
    setLitigationCosts("");
    setIntangibleCosts("");
    setProbability(100);
    setYearsToPayment("");
    setDiscountRate(4);
    clearSessionKeys("tool:plaintiff-ev:");
  }

  const dmg = parseNum(damages);
  const f = parseNum(fees);
  const lit = parseNum(litigationCosts);
  const intang = parseNum(intangibleCosts);
  const years = parseNum(yearsToPayment);

  const probabilityAdjusted = dmg * (probability / 100);
  const discountFactor = years > 0 ? 1 / Math.pow(1 + discountRate / 100, years) : 1;
  const discountedValue = probabilityAdjusted * discountFactor;
  const expectedValue = discountedValue - f - lit - intang;

  const hasAny =
    damages !== "" ||
    fees !== "" ||
    litigationCosts !== "" ||
    intangibleCosts !== "" ||
    yearsToPayment !== "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6 print:hidden">
        {/* Damages */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Damages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-[calc(50%-0.5rem)]">
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Plaintiff&apos;s total damages
              </label>
              <DollarInput
                value={damages}
                onChange={setDamages}
                placeholder="250,000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Probability of Success */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Probability of Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PercentSlider
              value={probability}
              onChange={setProbability}
              min={1}
              max={100}
            />
          </CardContent>
        </Card>

        {/* Time Value Discount */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Time Value Discount
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-[calc(50%-0.5rem)]">
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Years to payment
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={yearsToPayment}
                onChange={(e) => setYearsToPayment(e.target.value)}
                placeholder="2"
                className={textFieldClass}
              />
            </div>

            <PercentSlider
              value={discountRate}
              onChange={setDiscountRate}
              min={1}
              max={10}
              allowOverflow
              label="Annual discount rate"
            />
          </CardContent>
        </Card>

        {/* Fees & Costs */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Fees &amp; Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Attorneys&apos; fees (leave blank if contingency)
              </label>
              <DollarInput
                value={fees}
                onChange={setFees}
                placeholder="25,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Litigation costs
              </label>
              <DollarInput
                value={litigationCosts}
                onChange={setLitigationCosts}
                placeholder="10,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Intangible costs
              </label>
              <DollarInput
                value={intangibleCosts}
                onChange={setIntangibleCosts}
                placeholder="5,000"
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
          {/* Total */}
          <Card className="bg-white border-brand-accent">
            <CardContent className="pt-6">
              <p className="text-sm text-brand-muted mb-1">Plaintiff&apos;s Expected Value</p>
              <p className="text-3xl font-bold text-brand-accent">
                {fmt(expectedValue)}
              </p>
            </CardContent>
          </Card>

          {/* Breakdown */}
          <Card className="bg-white border-brand-border">
            <CardHeader>
              <CardTitle className="text-brand-primary text-base">Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <tbody>
                  <Row label="Total damages" value={dmg} />
                  <Row label="Probability of success" value={`${probability}%`} />
                  <Row label="Probability-adjusted value" value={probabilityAdjusted} bold />
                  <Separator />
                  <Row label="Years to payment" value={years > 0 ? `${years}` : "—"} />
                  <Row label="Annual discount rate" value={`${discountRate}%`} />
                  <Row label="Discounted value" value={discountedValue} bold />
                  <Separator />
                  <Row label="Attorneys fees" value={f} negative />
                  <Row label="Litigation costs" value={lit} negative />
                  <Row label="Intangible costs" value={intang} negative />
                  <Separator />
                  <tr>
                    <td className="py-2 font-semibold text-brand-primary">Expected value</td>
                    <td className="py-2 text-right font-semibold text-brand-accent">
                      {fmt(expectedValue)}
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
    </div>
  );
}
