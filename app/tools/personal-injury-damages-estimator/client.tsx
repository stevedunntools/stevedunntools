"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

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

const MULTIPLIER_STEPS = [1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PersonalInjuryClient() {
  const [medicalToDate, setMedicalToDate] = useState("");
  const [futureMedical, setFutureMedical] = useState("");
  const [lostEarningsToDate, setLostEarningsToDate] = useState("");
  const [futureLostEarnings, setFutureLostEarnings] = useState("");
  const [propertyDamage, setPropertyDamage] = useState("");
  const [multiplier, setMultiplier] = useState(3);

  const [committed, setCommitted] = useState({
    medicalToDate: "",
    futureMedical: "",
    lostEarningsToDate: "",
    futureLostEarnings: "",
    propertyDamage: "",
    multiplier: 3,
  });

  function commit() {
    setCommitted({
      medicalToDate,
      futureMedical,
      lostEarningsToDate,
      futureLostEarnings,
      propertyDamage,
      multiplier,
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commit();
  }

  function clearAll() {
    setMedicalToDate("");
    setFutureMedical("");
    setLostEarningsToDate("");
    setFutureLostEarnings("");
    setPropertyDamage("");
    setMultiplier(3);
    setCommitted({
      medicalToDate: "",
      futureMedical: "",
      lostEarningsToDate: "",
      futureLostEarnings: "",
      propertyDamage: "",
      multiplier: 3,
    });
  }

  const calc = useMemo(() => {
    const medTo = parseNum(committed.medicalToDate);
    const medFuture = parseNum(committed.futureMedical);
    const earnTo = parseNum(committed.lostEarningsToDate);
    const earnFuture = parseNum(committed.futureLostEarnings);
    const prop = parseNum(committed.propertyDamage);
    const mult = committed.multiplier;

    const totalMedical = medTo + medFuture;
    const painAndSuffering = totalMedical * mult;
    const total = painAndSuffering + earnTo + earnFuture + prop;

    return {
      medicalToDate: medTo,
      futureMedical: medFuture,
      totalMedical,
      multiplier: mult,
      painAndSuffering,
      lostEarningsToDate: earnTo,
      futureLostEarnings: earnFuture,
      propertyDamage: prop,
      total,
    };
  }, [committed]);

  const hasAny =
    medicalToDate !== "" ||
    futureMedical !== "" ||
    lostEarningsToDate !== "" ||
    futureLostEarnings !== "" ||
    propertyDamage !== "";

  const inputClass =
    "w-full pl-7 pr-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6">
        {/* Medical Expenses */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Medical Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-primary mb-1.5">
                  Medical expenses to date
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={medicalToDate}
                    onChange={(e) => setMedicalToDate(e.target.value)}
                    onBlur={commit}
                    onKeyDown={handleKeyDown}
                    placeholder="25,000"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-primary mb-1.5">
                  Future medical expenses
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={futureMedical}
                    onChange={(e) => setFutureMedical(e.target.value)}
                    onBlur={commit}
                    onKeyDown={handleKeyDown}
                    placeholder="10,000"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pain & Suffering Multiplier */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Pain &amp; Suffering Multiplier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-muted">1.5×</span>
              <span className="text-lg font-semibold text-brand-accent">{multiplier}×</span>
              <span className="text-sm text-brand-muted">5×</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="5"
              step="0.5"
              value={multiplier}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setMultiplier(val);
                setCommitted((prev) => ({ ...prev, multiplier: val }));
              }}
              className="w-full accent-brand-accent"
            />
            <div className="flex justify-between px-1">
              {MULTIPLIER_STEPS.map((v) => (
                <span
                  key={v}
                  className={`text-xs ${
                    v === multiplier ? "text-brand-accent font-medium" : "text-brand-muted/50"
                  }`}
                >
                  {v}
                </span>
              ))}
            </div>
            <p className="text-xs text-brand-muted">
              Applied to total medical expenses (to date + future)
            </p>
          </CardContent>
        </Card>

        {/* Lost Earnings */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Lost Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-primary mb-1.5">
                  Lost earnings to date
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={lostEarningsToDate}
                    onChange={(e) => setLostEarningsToDate(e.target.value)}
                    onBlur={commit}
                    onKeyDown={handleKeyDown}
                    placeholder="15,000"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-primary mb-1.5">
                  Future lost earnings
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={futureLostEarnings}
                    onChange={(e) => setFutureLostEarnings(e.target.value)}
                    onBlur={commit}
                    onKeyDown={handleKeyDown}
                    placeholder="20,000"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Damage */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Property Damage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-[calc(50%-0.5rem)]">
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Property damage
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={propertyDamage}
                  onChange={(e) => setPropertyDamage(e.target.value)}
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
              <p className="text-sm text-brand-muted mb-1">Estimated Total Damages</p>
              <p className="text-3xl font-bold text-brand-accent">
                {fmt(calc.total)}
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
                  <Row label="Medical expenses to date" value={calc.medicalToDate} />
                  <Row label="Future medical expenses" value={calc.futureMedical} />
                  <Row label="Total medical expenses" value={calc.totalMedical} bold />
                  <Separator />
                  <Row
                    label={`Pain & suffering (${calc.multiplier}× medical)`}
                    value={calc.painAndSuffering}
                    bold
                  />
                  <Separator />
                  <Row label="Lost earnings to date" value={calc.lostEarningsToDate} />
                  <Row label="Future lost earnings" value={calc.futureLostEarnings} />
                  <Row label="Property damage" value={calc.propertyDamage} />
                  <Separator />
                  <tr>
                    <td className="py-2 font-semibold text-brand-primary">Total</td>
                    <td className="py-2 text-right font-semibold text-brand-accent">
                      {fmt(calc.total)}
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
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <tr>
      <td className={`py-1.5 ${bold ? "font-medium text-brand-primary" : "text-brand-muted"}`}>
        {label}
      </td>
      <td
        className={`py-1.5 text-right tabular-nums ${
          bold ? "font-medium text-brand-primary" : "text-brand-muted"
        }`}
      >
        {fmt(value)}
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
