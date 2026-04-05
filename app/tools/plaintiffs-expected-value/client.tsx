"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { getToolValue } from "@/lib/tool-store";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function parseNum(s: string): number {
  const cleaned = s.replace(/[$,\s]/g, "");
  if (cleaned === "") return 0;
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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

  // Auto-populate damages from either damages estimator
  useEffect(() => {
    // Check both estimators, use whichever has a value
    const piTotal = getToolValue<number>("personal-injury-damages-estimator.total");
    const empTotal = getToolValue<number>("employment-damages-estimator.total");
    const best = (piTotal && piTotal > 0) ? piTotal : (empTotal && empTotal > 0) ? empTotal : null;

    if (best) {
      const formatted = best.toFixed(0);
      setDamages(formatted);
      setCommitted((prev) => ({ ...prev, damages: formatted }));
    }

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (
        (detail.key === "personal-injury-damages-estimator.total" ||
          detail.key === "employment-damages-estimator.total") &&
        detail.value > 0
      ) {
        const formatted = (detail.value as number).toFixed(0);
        setDamages(formatted);
        setCommitted((prev) => ({ ...prev, damages: formatted }));
      }
    };
    window.addEventListener("sdt-store-update", handler);
    return () => window.removeEventListener("sdt-store-update", handler);
  }, []);

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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commit();
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

  const inputClass =
    "w-full pl-7 pr-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

  const plainInputClass =
    "w-full px-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

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
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={damages}
                  onChange={(e) => setDamages(e.target.value)}
                  onBlur={commit}
                  onKeyDown={handleKeyDown}
                  placeholder="250,000"
                  className={inputClass}
                />
              </div>
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
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-muted">1%</span>
              <span className="text-lg font-semibold text-brand-accent">{probability}%</span>
              <span className="text-sm text-brand-muted">100%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={probability}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setProbability(val);
                setCommitted((prev) => ({ ...prev, probability: val }));
              }}
              className="w-full accent-brand-accent"
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
                onKeyDown={handleKeyDown}
                placeholder="2"
                className={plainInputClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-brand-primary">Annual discount rate</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-muted">1%</span>
                <span className="text-lg font-semibold text-brand-accent">{discountRate}%</span>
                <span className="text-sm text-brand-muted">10%</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={discountRate}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setDiscountRate(val);
                  setCommitted((prev) => ({ ...prev, discountRate: val }));
                }}
                className="w-full accent-brand-accent"
              />
            </div>
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
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  onBlur={commit}
                  onKeyDown={handleKeyDown}
                  placeholder="25,000"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Litigation costs
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={litigationCosts}
                  onChange={(e) => setLitigationCosts(e.target.value)}
                  onBlur={commit}
                  onKeyDown={handleKeyDown}
                  placeholder="10,000"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Intangible costs
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={intangibleCosts}
                  onChange={(e) => setIntangibleCosts(e.target.value)}
                  onBlur={commit}
                  onKeyDown={handleKeyDown}
                  placeholder="5,000"
                  className={inputClass}
                />
              </div>
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
                  <Row label="Total damages" value={fmt(calc.damages)} />
                  <Row label="Probability of success" value={`${calc.probability}%`} />
                  <Row label="Probability-adjusted value" value={fmt(calc.probabilityAdjusted)} bold />
                  <Separator />
                  <Row label="Years to payment" value={calc.years > 0 ? `${calc.years}` : "—"} />
                  <Row label="Annual discount rate" value={`${calc.discountRate}%`} />
                  <Row label="Discounted value" value={fmt(calc.discountedValue)} bold />
                  <Separator />
                  <Row label="Attorneys fees" value={`(${fmt(calc.fees)})`} negative />
                  <Row label="Litigation costs" value={`(${fmt(calc.litigationCosts)})`} negative />
                  <Row label="Intangible costs" value={`(${fmt(calc.intangibleCosts)})`} negative />
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

// ---------------------------------------------------------------------------
// Table helpers
// ---------------------------------------------------------------------------

function Row({
  label,
  value,
  bold,
  negative,
}: {
  label: string;
  value: string;
  bold?: boolean;
  negative?: boolean;
}) {
  return (
    <tr>
      <td className={`py-1.5 ${bold ? "font-medium text-brand-primary" : "text-brand-muted"}`}>
        {label}
      </td>
      <td
        className={`py-1.5 text-right tabular-nums ${
          bold ? "font-medium text-brand-primary" : negative ? "text-brand-error" : "text-brand-muted"
        }`}
      >
        {value}
      </td>
    </tr>
  );
}

function Separator() {
  return (
    <tr>
      <td colSpan={2} className="py-1">
        <div className="border-t border-brand-border" />
      </td>
    </tr>
  );
}
