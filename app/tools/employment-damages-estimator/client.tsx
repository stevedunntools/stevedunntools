"use client";

import { useSessionState, clearSessionKeys } from "@/lib/use-session-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { fmt, parseNum } from "@/lib/format";
import { Row, Separator } from "@/components/breakdown-table";
import DollarInput from "@/components/dollar-input";
import EstimateDisclaimer from "@/components/estimate-disclaimer";
import ExportPdfButton from "@/components/export-pdf-button";
import { textFieldClass, selectFieldClass } from "@/lib/field-styles";
import MobileResultBar from "@/components/mobile-result-bar";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type LiquidatedType = "none" | "2x-wages" | "2x-wages-benefits" | "3x-wages";

const liquidatedOptions: { value: LiquidatedType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "2x-wages", label: "2× back pay compensation (FLSA / ADEA / EPA)" },
  { value: "2x-wages-benefits", label: "2× back pay compensation + benefits (FMLA)" },
  { value: "3x-wages", label: "3× back pay compensation (state statutes)" },
];

interface MitigationJob {
  id: string;
  months: string;
  monthlyComp: string;
  current: boolean;
}

function makeJobId() {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EmploymentDamagesClient() {
  const [monthlyComp, setMonthlyComp] = useSessionState("tool:emp-damages:monthlyComp", "");
  const [monthlyBenefits, setMonthlyBenefits] = useSessionState("tool:emp-damages:monthlyBenefits", "");
  const [monthsSinceTermination, setMonthsSinceTermination] = useSessionState("tool:emp-damages:monthsSinceTermination", "");
  const [frontPayMonths, setFrontPayMonths] = useSessionState("tool:emp-damages:frontPayMonths", "");
  const [jobs, setJobs] = useSessionState<MitigationJob[]>("tool:emp-damages:jobs", [
    { id: makeJobId(), months: "", monthlyComp: "", current: false },
  ]);
  const [compensatory, setCompensatory] = useSessionState("tool:emp-damages:compensatory", "");
  const [liquidatedType, setLiquidatedType] = useSessionState<LiquidatedType>("tool:emp-damages:liquidatedType", "none");
  const [punitive, setPunitive] = useSessionState("tool:emp-damages:punitive", "");
  const [otherDamages, setOtherDamages] = useSessionState("tool:emp-damages:otherDamages", "");

  function addJob() {
    setJobs([...jobs, { id: makeJobId(), months: "", monthlyComp: "", current: false }]);
  }

  function updateJob(id: string, field: "months" | "monthlyComp" | "current", value: string | boolean) {
    setJobs(jobs.map((j) => (j.id === id ? { ...j, [field]: value } : j)));
  }

  function removeJob(id: string) {
    setJobs(jobs.filter((j) => j.id !== id));
  }

  function clearAll() {
    setMonthlyComp("");
    setMonthlyBenefits("");
    setMonthsSinceTermination("");
    setFrontPayMonths("");
    setJobs([{ id: makeJobId(), months: "", monthlyComp: "", current: false }]);
    setCompensatory("");
    setLiquidatedType("none");
    setPunitive("");
    setOtherDamages("");
    clearSessionKeys("tool:emp-damages:");
  }

  const comp = parseNum(monthlyComp);
  const benefits = parseNum(monthlyBenefits);
  const bpMonths = parseNum(monthsSinceTermination);
  const fpMonths = parseNum(frontPayMonths);
  const compDamages = parseNum(compensatory);
  const pun = parseNum(punitive);
  const other = parseNum(otherDamages);

  // Back pay = (compensation + benefits) × months since termination
  const backPayComp = comp * bpMonths;
  const backPayBenefits = benefits * bpMonths;
  const backPay = backPayComp + backPayBenefits;

  // Mitigation = sum of all earnings from all jobs
  const totalMitigation = jobs.reduce(
    (sum, j) => sum + parseNum(j.months) * parseNum(j.monthlyComp),
    0
  );

  const netBackPay = Math.max(0, backPay - totalMitigation);

  // Front pay = months × (comp at termination - current job comp if currently employed)
  const currentJob = jobs.find((j) => j.current);
  const currentJobComp = currentJob ? parseNum(currentJob.monthlyComp) : 0;
  const frontPay = Math.max(0, comp - currentJobComp) * fpMonths;

  // Liquidated damages (based on back pay only, before mitigation)
  let liquidated = 0;
  if (liquidatedType === "2x-wages") {
    liquidated = backPayComp;
  } else if (liquidatedType === "2x-wages-benefits") {
    liquidated = backPay;
  } else if (liquidatedType === "3x-wages") {
    liquidated = backPayComp * 2;
  }

  const grossTotal = netBackPay + frontPay + compDamages + liquidated + pun + other;

  const hasAny =
    monthlyComp !== "" ||
    monthlyBenefits !== "" ||
    monthsSinceTermination !== "" ||
    frontPayMonths !== "" ||
    jobs.some((j) => j.months !== "" || j.monthlyComp !== "") ||
    compensatory !== "" ||
    punitive !== "" ||
    otherDamages !== "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6 print:hidden">
        {/* Back Pay */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Back Pay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-primary mb-1.5">
                  Monthly compensation at termination
                </label>
                <DollarInput
                  value={monthlyComp}
                  onChange={setMonthlyComp}
                  placeholder="7,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-primary mb-1.5">
                  Monthly benefits value
                </label>
                <DollarInput
                  value={monthlyBenefits}
                  onChange={setMonthlyBenefits}
                  placeholder="1,500"
                />
              </div>
            </div>
            <div className="max-w-[calc(50%-0.5rem)]">
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Months since termination
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={monthsSinceTermination}
                onChange={(e) => setMonthsSinceTermination(e.target.value)}
                placeholder="12"
                className={textFieldClass}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mitigation */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Mitigation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.map((job, idx) => (
              <div key={job.id} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-medium text-brand-muted mb-1">
                      Months employed
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={job.months}
                      onChange={(e) => updateJob(job.id, "months", e.target.value)}
                      placeholder="6"
                      className={textFieldClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-muted mb-1">
                      Monthly compensation
                    </label>
                    <DollarInput
                      value={job.monthlyComp}
                      onChange={(v) => updateJob(job.id, "monthlyComp", v)}
                      placeholder="5,000"
                    />
                  </div>
                  <button
                    onClick={() => removeJob(job.id)}
                    className="sm:mt-5 p-3 sm:p-2 text-brand-muted hover:text-brand-error transition-colors justify-self-end"
                    aria-label={`Remove job ${idx + 1}`}
                  >
                    <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                  </button>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={job.current}
                    onChange={(e) => updateJob(job.id, "current", e.target.checked)}
                    className="h-5 w-5 sm:h-4 sm:w-4 rounded border-brand-border text-brand-accent focus:ring-brand-accent"
                  />
                  <span className="text-xs text-brand-muted">Currently employed</span>
                </label>
                {idx < jobs.length - 1 && (
                  <div className="border-t border-brand-border/50 pt-2" />
                )}
              </div>
            ))}

            <Button variant="outline" onClick={addJob} className="w-full">
              Add Job
            </Button>
          </CardContent>
        </Card>

        {/* Front Pay */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Front Pay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-[calc(50%-0.5rem)]">
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Months of front pay
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={frontPayMonths}
                onChange={(e) => setFrontPayMonths(e.target.value)}
                placeholder="6"
                className={textFieldClass}
              />
              <p className="mt-1 text-xs text-brand-muted">
                Offset by current compensation if applicable
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Damages */}
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Additional Damages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Compensatory damages (emotional distress)
              </label>
              <DollarInput
                value={compensatory}
                onChange={setCompensatory}
                placeholder="50,000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Liquidated damages
              </label>
              <select
                value={liquidatedType}
                onChange={(e) => setLiquidatedType(e.target.value as LiquidatedType)}
                className={selectFieldClass}
              >
                {liquidatedOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Punitive damages
              </label>
              <DollarInput
                value={punitive}
                onChange={setPunitive}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Other damages
              </label>
              <DollarInput
                value={otherDamages}
                onChange={setOtherDamages}
                placeholder="0"
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
          <Card id="tool-headline-result" className="bg-white border-brand-accent">
            <CardContent className="pt-6">
              <p className="text-sm text-brand-muted mb-1">Estimated Total Damages</p>
              <p className="text-3xl font-bold text-brand-accent">
                {fmt(grossTotal)}
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
                  <Row label="Back pay (compensation)" value={backPayComp} />
                  <Row label="Back pay (benefits)" value={backPayBenefits} />
                  <Row label="Gross back pay" value={backPay} bold />
                  <Row label="Less: mitigation" value={totalMitigation} negative />
                  <Row label="Net back pay" value={netBackPay} bold />
                  <Separator />
                  <Row label="Front pay" value={frontPay} />
                  <Separator />
                  <Row label="Compensatory damages" value={compDamages} />
                  <Row label="Liquidated damages" value={liquidated} />
                  <Row label="Punitive damages" value={pun} />
                  <Row label="Other damages" value={other} />
                  <Separator />
                  <tr>
                    <td className="py-2 font-semibold text-brand-primary">Total</td>
                    <td className="py-2 text-right font-semibold text-brand-accent">
                      {fmt(grossTotal)}
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
      <MobileResultBar label="Total damages" value={fmt(grossTotal)} targetId="tool-headline-result" />
    </div>
  );
}
