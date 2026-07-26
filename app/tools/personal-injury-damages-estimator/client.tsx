"use client";

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
import ResultsShell from "@/components/results-shell";
import MobileResultBar from "@/components/mobile-result-bar";

const MULTIPLIER_STEPS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export default function PersonalInjuryClient() {
  const hydrated = useHydrated();
  const [medicalToDate, setMedicalToDate] = useSessionState("tool:pi-damages:medicalToDate", "");
  const [futureMedical, setFutureMedical] = useSessionState("tool:pi-damages:futureMedical", "");
  const [lostEarningsToDate, setLostEarningsToDate] = useSessionState("tool:pi-damages:lostEarningsToDate", "");
  const [futureLostEarnings, setFutureLostEarnings] = useSessionState("tool:pi-damages:futureLostEarnings", "");
  const [propertyDamage, setPropertyDamage] = useSessionState("tool:pi-damages:propertyDamage", "");
  const [multiplier, setMultiplier] = useSessionState("tool:pi-damages:multiplier", 3);

  function clearAll() {
    setMedicalToDate("");
    setFutureMedical("");
    setLostEarningsToDate("");
    setFutureLostEarnings("");
    setPropertyDamage("");
    setMultiplier(3);
    clearSessionKeys("tool:pi-damages:");
  }

  const medTo = parseNumNonNeg(medicalToDate);
  const medFuture = parseNumNonNeg(futureMedical);
  const earnTo = parseNumNonNeg(lostEarningsToDate);
  const earnFuture = parseNumNonNeg(futureLostEarnings);
  const prop = parseNumNonNeg(propertyDamage);

  const totalMedical = medTo + medFuture;
  const painAndSuffering = totalMedical * multiplier;
  const total = totalMedical + painAndSuffering + earnTo + earnFuture + prop;

  const hasAny =
    medicalToDate !== "" ||
    futureMedical !== "" ||
    lostEarningsToDate !== "" ||
    futureLostEarnings !== "" ||
    propertyDamage !== "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6 print:hidden">
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
                <label
                  htmlFor="pi-damages-medical-to-date"
                  className="block text-sm font-medium text-brand-primary mb-1.5"
                >
                  Medical expenses to date
                </label>
                <DollarInput
                  id="pi-damages-medical-to-date"
                  value={medicalToDate}
                  onChange={setMedicalToDate}
                  placeholder="25,000"
                />
              </div>
              <div>
                <label
                  htmlFor="pi-damages-future-medical"
                  className="block text-sm font-medium text-brand-primary mb-1.5"
                >
                  Future medical expenses
                </label>
                <DollarInput
                  id="pi-damages-future-medical"
                  value={futureMedical}
                  onChange={setFutureMedical}
                  placeholder="10,000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pain & Suffering Multiplier */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Non-Economic Damages Multiple of Medical Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-muted">1×</span>
              <span className="text-lg font-semibold text-brand-accent">{multiplier}×</span>
              <span className="text-sm text-brand-muted">5×</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={multiplier}
              onChange={(e) => setMultiplier(parseFloat(e.target.value))}
              aria-label="Non-economic damages multiple of medical expenses"
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
                <label
                  htmlFor="pi-damages-lost-earnings-to-date"
                  className="block text-sm font-medium text-brand-primary mb-1.5"
                >
                  Lost earnings to date
                </label>
                <DollarInput
                  id="pi-damages-lost-earnings-to-date"
                  value={lostEarningsToDate}
                  onChange={setLostEarningsToDate}
                  placeholder="15,000"
                />
              </div>
              <div>
                <label
                  htmlFor="pi-damages-future-lost-earnings"
                  className="block text-sm font-medium text-brand-primary mb-1.5"
                >
                  Future lost earnings
                </label>
                <DollarInput
                  id="pi-damages-future-lost-earnings"
                  value={futureLostEarnings}
                  onChange={setFutureLostEarnings}
                  placeholder="20,000"
                />
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
              <label
                htmlFor="pi-damages-property-damage"
                className="block text-sm font-medium text-brand-primary mb-1.5"
              >
                Property damage
              </label>
              <DollarInput
                id="pi-damages-property-damage"
                value={propertyDamage}
                onChange={setPropertyDamage}
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
        <ResultsShell
          label="Estimated Total Damages"
          value={hydrated ? fmt(total) : "—"}
        >
          {/* Breakdown */}
          <Card className="bg-white border-brand-border">
            <CardHeader>
              <CardTitle className="text-brand-primary text-base">Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <tbody>
                  <Row label="Medical expenses to date" value={hydrated ? medTo : "—"} />
                  <Row label="Future medical expenses" value={hydrated ? medFuture : "—"} />
                  <Row label="Total medical expenses" value={hydrated ? totalMedical : "—"} bold />
                  <Separator />
                  <Row
                    label={hydrated ? `Non-economic damages (${multiplier}× medical)` : "Non-economic damages"}
                    value={hydrated ? painAndSuffering : "—"}
                    bold
                  />
                  <Separator />
                  <Row label="Lost earnings to date" value={hydrated ? earnTo : "—"} />
                  <Row label="Future lost earnings" value={hydrated ? earnFuture : "—"} />
                  <Row label="Property damage" value={hydrated ? prop : "—"} />
                  <Separator />
                  <TotalRow label="Total" value={hydrated ? fmt(total) : "—"} />
                </tbody>
              </table>
            </CardContent>
          </Card>
        </ResultsShell>
      </div>
      <MobileResultBar label="Total damages" value={hydrated ? fmt(total) : "—"} targetId="tool-headline-result" />
    </div>
  );
}
