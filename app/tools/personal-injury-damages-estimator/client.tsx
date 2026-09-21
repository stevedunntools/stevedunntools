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

const MULTIPLIER_STEPS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

/** Plain-English severity anchor for a multiplier value — the classic
 *  adjuster bands: severity, permanence, and objective documentation are
 *  what justify moving up the range. */
function severityAnchor(m: number): string {
  if (m <= 1.5) return "minor soft-tissue injuries with full recovery";
  if (m <= 3) return "moderate injuries — fractures, injuries requiring surgery";
  if (m <= 4) return "severe injuries with lasting or partially permanent effects";
  return "permanent or catastrophic injuries";
}

export default function PersonalInjuryClient() {
  const hydrated = useHydrated();
  const [medicalToDate, setMedicalToDate] = useSessionState("tool:pi-damages:medicalToDate", "");
  const [futureMedical, setFutureMedical] = useSessionState("tool:pi-damages:futureMedical", "");
  const [lostEarningsToDate, setLostEarningsToDate] = useSessionState("tool:pi-damages:lostEarningsToDate", "");
  const [futureLostEarnings, setFutureLostEarnings] = useSessionState("tool:pi-damages:futureLostEarnings", "");
  const [propertyDamage, setPropertyDamage] = useSessionState("tool:pi-damages:propertyDamage", "");
  const [multiplier, setMultiplier] = useSessionState("tool:pi-damages:multiplier", 3);
  const [pastOnlyBase, setPastOnlyBase] = useSessionState("tool:pi-damages:pastOnlyBase", false);
  const [faultPct, setFaultPct] = useSessionState("tool:pi-damages:faultPct", 0);

  function clearAll() {
    setMedicalToDate("");
    setFutureMedical("");
    setLostEarningsToDate("");
    setFutureLostEarnings("");
    setPropertyDamage("");
    setMultiplier(3);
    setPastOnlyBase(false);
    setFaultPct(0);
    clearSessionKeys("tool:pi-damages:");
  }

  const medTo = parseNumNonNeg(medicalToDate);
  const medFuture = parseNumNonNeg(futureMedical);
  const earnTo = parseNumNonNeg(lostEarningsToDate);
  const earnFuture = parseNumNonNeg(futureLostEarnings);
  const prop = parseNumNonNeg(propertyDamage);

  const totalMedical = medTo + medFuture;
  const multiplierBase = pastOnlyBase ? medTo : totalMedical;

  // Total at a given multiplier, after the comparative-fault reduction —
  // used for the headline and for the ±1× range around the chosen value.
  function totalAt(m: number) {
    const gross = totalMedical + multiplierBase * m + earnTo + earnFuture + prop;
    return gross - Math.round(gross * faultPct) / 100;
  }

  const painAndSuffering = multiplierBase * multiplier;
  const grossTotal = totalMedical + painAndSuffering + earnTo + earnFuture + prop;
  const faultReduction = Math.round(grossTotal * faultPct) / 100;
  const total = grossTotal - faultReduction;

  const rangeLowMult = Math.max(1, multiplier - 1);
  const rangeHighMult = Math.min(5, multiplier + 1);
  const showRange = multiplierBase > 0;

  const hasAny =
    medicalToDate !== "" ||
    futureMedical !== "" ||
    lostEarningsToDate !== "" ||
    futureLostEarnings !== "" ||
    propertyDamage !== "" ||
    pastOnlyBase ||
    faultPct !== 0;

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
                  placeholder="e.g. 25,000"
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
                  placeholder="e.g. 10,000"
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
              <span className="text-lg font-semibold text-brand-accent-text">{multiplier}×</span>
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
                    v === multiplier ? "text-brand-accent-text font-medium" : "text-brand-muted/50"
                  }`}
                >
                  {v}
                </span>
              ))}
            </div>
            <p className="text-sm text-brand-primary">
              {multiplier}&times; is typical of{" "}
              <span className="font-medium">{severityAnchor(multiplier)}</span>.
            </p>
            <p className="text-xs text-brand-muted">
              Clear liability, objectively documented injuries (imaging,
              surgery), physician-directed treatment, recovery over six
              months, and documented permanency justify the upper end of the
              range.
            </p>
            <label className="flex items-start gap-2 cursor-pointer select-none text-sm pt-1">
              <input
                type="checkbox"
                checked={pastOnlyBase}
                onChange={(e) => setPastOnlyBase(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-brand-border text-brand-accent focus:ring-brand-accent"
              />
              <span>
                <span className="text-brand-primary">
                  Apply multiplier to past medical expenses only
                </span>
                <span className="block text-xs text-brand-muted">
                  Large future medical costs (life-care plans) are often
                  treated as economic damages rather than multiplied. Future
                  medicals still count toward the total either way.
                </span>
              </span>
            </label>
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
                  placeholder="e.g. 15,000"
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
                  placeholder="e.g. 20,000"
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
                placeholder="e.g. 5,000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Comparative Fault */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Plaintiff&apos;s Share of Fault
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <PercentSlider
              value={faultPct}
              onChange={setFaultPct}
              min={0}
              max={100}
              label="The estimate is reduced by this percentage. State rules differ: pure comparative states reduce recovery at any fault level, most states bar recovery entirely at 50% or 51%, and a few contributory-negligence states bar it at any fault."
              aria-label="Plaintiff's share of fault percentage"
            />
            {faultPct >= 50 && (
              <p className="text-xs text-brand-error">
                At {faultPct}% fault, most states would bar recovery entirely
                — this estimate applies a proportional reduction only.
              </p>
            )}
          </CardContent>
        </Card>

        {hasAny && (
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </div>

      <PrintInputs items={[
        { label: "Medical expenses to date", value: medicalToDate ? "$" + medicalToDate : "" },
        { label: "Future medical", value: futureMedical ? "$" + futureMedical : "" },
        { label: "Lost earnings to date", value: lostEarningsToDate ? "$" + lostEarningsToDate : "" },
        { label: "Future lost earnings", value: futureLostEarnings ? "$" + futureLostEarnings : "" },
        { label: "Property damage", value: propertyDamage ? "$" + propertyDamage : "" },
        { label: "Non-economic multiple", value: `${multiplier}×` },
        { label: "Multiple applied to", value: pastOnlyBase ? "past medical only" : "all medical" },
        { label: "Plaintiff's share of fault", value: `${faultPct}%` },
      ]} />
      {/* Results */}
      <div className="lg:col-span-2">
        <ResultsShell
          label="Estimated Total Damages"
          value={hydrated && hasAny ? fmt(total) : "—"}
          headlineExtra={
            hydrated && showRange ? (
              <p className="mt-2 text-sm text-brand-muted">
                Range at &plusmn;1&times;: {fmt(totalAt(rangeLowMult))} (
                {rangeLowMult}&times;) &ndash; {fmt(totalAt(rangeHighMult))} (
                {rangeHighMult}&times;)
              </p>
            ) : undefined
          }
        >
          {/* Breakdown */}
          <Card className="bg-white border-brand-border">
            <CardHeader>
              <CardTitle className="text-brand-primary text-base">Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <tbody>
                  <Row label="Medical expenses to date" value={hydrated && hasAny ? medTo : "—"} />
                  <Row label="Future medical expenses" value={hydrated && hasAny ? medFuture : "—"} />
                  <Row label="Total medical expenses" value={hydrated && hasAny ? totalMedical : "—"} bold />
                  <Separator />
                  <Row
                    label={
                      hydrated
                        ? `Non-economic damages (${multiplier}× ${pastOnlyBase ? "past medical" : "medical"})`
                        : "Non-economic damages"
                    }
                    value={hydrated && hasAny ? painAndSuffering : "—"}
                    bold
                  />
                  <Separator />
                  <Row label="Lost earnings to date" value={hydrated && hasAny ? earnTo : "—"} />
                  <Row label="Future lost earnings" value={hydrated && hasAny ? earnFuture : "—"} />
                  <Row label="Property damage" value={hydrated && hasAny ? prop : "—"} />
                  {hydrated && faultPct > 0 && (
                    <>
                      <Separator />
                      <Row label="Gross damages" value={grossTotal} bold />
                      <Row
                        label={`Less: plaintiff's fault (${faultPct}%)`}
                        value={faultReduction}
                        negative
                      />
                    </>
                  )}
                  <Separator />
                  <TotalRow label="Total" value={hydrated && hasAny ? fmt(total) : "—"} />
                </tbody>
              </table>
            </CardContent>
          </Card>
        </ResultsShell>
      </div>
      <MobileResultBar label="Total damages" value={hydrated && hasAny ? fmt(total) : "—"} />
    </div>
  );
}
