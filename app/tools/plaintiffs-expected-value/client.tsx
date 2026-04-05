"use client";

import { useState, useMemo } from "react";
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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const plainInputClass =
  "w-full px-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

export default function PlaintiffsExpectedValueClient() {
  const [damages, setDamages] = useState("");
  const [fees, setFees] = useState("");
  const [litigationCosts, setLitigationCosts] = useState("");
  const [intangibleCosts, setIntangibleCosts] = useState("");
  const [probability, setProbability] = useState(100);
  const [yearsToPayment, setYearsToPayment] = useState("");
  const [discountRate, setDiscountRate] = useState(4);

  const [committed, setCommitted] = useState({
    damages: "",
    fees: "",
    litigationCosts: "",
    intangibleCosts: "",
    probability: 100,
    yearsToPayment: "",
    discountRate: 4,
  });

  function commit() {
    setCommitted({
      damages,
      fees,
      litigationCosts,
      intangibleCosts,
      probability,
      yearsToPayment,
      discountRate,
    });
  }

  function clearAll() {
    setDamages("");
    setFees("");
    setLitigationCosts("");
    setIntangibleCosts("");
    setProbability(100);
    setYearsToPayment("");
    setDiscountRate(4);
    setCommitted({
      damages: "",
      fees: "",
      litigationCosts: "",
      intangibleCosts: "",
      probability: 100,
      yearsToPayment: "",
      discountRate: 4,
    });
  }

  const calc = useMemo(() => {
    const dmg = parseNum(committed.damages);
    const f = parseNum(committed.fees);
    const lit = parseNum(committed.litigationCosts);
    const intang = parseNum(committed.intangibleCosts);
    const prob = committed.probability / 100;
    const years = parseNum(committed.yearsToPayment);
    const rate = committed.discountRate / 100;

    const probabilityAdjusted = dmg * prob;
    const discountFactor = years > 0 ? 1 / Math.pow(1 + rate, years) : 1;
    const discountedValue = probabilityAdjusted * discountFactor;
    const totalDeductions = f + lit + intang;
    const expectedValue = discountedValue - totalDeductions;

    return {
      damages: dmg,
      probability: committed.probability,
      probabilityAdjusted,
      years,
      discountRate: committed.discountRate,
      discountedValue,
      fees: f,
      litigationCosts: lit,
      intangibleCosts: intang,
      totalDeductions,
      expectedValue,
    };
  }, [committed]);

  const hasAny =
    damages !== "" ||
    fees !== "" ||
    litigationCosts !== "" ||
    intangibleCosts !== "" ||
    yearsToPayment !== "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6">
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
                onCommit={commit}
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
              onChange={(val) => {
                setProbability(val);
                setCommitted((prev) => ({ ...prev, probability: val }));
              }}
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
                onBlur={commit}
                onKeyDown={(e) => e.key === "Enter" && commit()}
                placeholder="2"
                className={plainInputClass}
              />
            </div>

            <PercentSlider
              value={discountRate}
              onChange={(val) => {
                setDiscountRate(val);
                setCommitted((prev) => ({ ...prev, discountRate: val }));
              }}
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
                Attorneys fees
              </label>
              <DollarInput
                value={fees}
                onChange={setFees}
                onCommit={commit}
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
                onCommit={commit}
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
                onCommit={commit}
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
                {fmt(calc.expectedValue)}
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
                  <Row label="Total damages" value={calc.damages} />
                  <Row label="Probability of success" value={`${calc.probability}%`} />
                  <Row label="Probability-adjusted value" value={calc.probabilityAdjusted} bold />
                  <Separator />
                  <Row label="Years to payment" value={calc.years > 0 ? `${calc.years}` : "\u2014"} />
                  <Row label="Annual discount rate" value={`${calc.discountRate}%`} />
                  <Row label="Discounted value" value={calc.discountedValue} bold />
                  <Separator />
                  <Row label="Attorneys fees" value={calc.fees} negative />
                  <Row label="Litigation costs" value={calc.litigationCosts} negative />
                  <Row label="Intangible costs" value={calc.intangibleCosts} negative />
                  <Separator />
                  <tr>
                    <td className="py-2 font-semibold text-brand-primary">Expected value</td>
                    <td className="py-2 text-right font-semibold text-brand-accent">
                      {fmt(calc.expectedValue)}
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
