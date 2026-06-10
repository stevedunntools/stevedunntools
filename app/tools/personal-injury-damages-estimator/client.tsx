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
import EstimateDisclaimer from "@/components/estimate-disclaimer";
import ExportPdfButton from "@/components/export-pdf-button";

const MULTIPLIER_STEPS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export default function PersonalInjuryClient() {
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

  const medTo = parseNum(medicalToDate);
  const medFuture = parseNum(futureMedical);
  const earnTo = parseNum(lostEarningsToDate);
  const earnFuture = parseNum(futureLostEarnings);
  const prop = parseNum(propertyDamage);

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
                <label className="block text-sm font-medium text-brand-primary mb-1.5">
                  Medical expenses to date
                </label>
                <DollarInput
                  value={medicalToDate}
                  onChange={setMedicalToDate}
                  placeholder="25,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-primary mb-1.5">
                  Future medical expenses
                </label>
                <DollarInput
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
                <DollarInput
                  value={lostEarningsToDate}
                  onChange={setLostEarningsToDate}
                  placeholder="15,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-primary mb-1.5">
                  Future lost earnings
                </label>
                <DollarInput
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
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Property damage
              </label>
              <DollarInput
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
        <div className="sticky top-20 space-y-6">
          {/* Total */}
          <Card className="bg-white border-brand-accent">
            <CardContent className="pt-6">
              <p className="text-sm text-brand-muted mb-1">Estimated Total Damages</p>
              <p className="text-3xl font-bold text-brand-accent">
                {fmt(total)}
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
                  <Row label="Medical expenses to date" value={medTo} />
                  <Row label="Future medical expenses" value={medFuture} />
                  <Row label="Total medical expenses" value={totalMedical} bold />
                  <Separator />
                  <Row
                    label={`Non-economic damages (${multiplier}× medical)`}
                    value={painAndSuffering}
                    bold
                  />
                  <Separator />
                  <Row label="Lost earnings to date" value={earnTo} />
                  <Row label="Future lost earnings" value={earnFuture} />
                  <Row label="Property damage" value={prop} />
                  <Separator />
                  <tr>
                    <td className="py-2 font-semibold text-brand-primary">Total</td>
                    <td className="py-2 text-right font-semibold text-brand-accent">
                      {fmt(total)}
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
