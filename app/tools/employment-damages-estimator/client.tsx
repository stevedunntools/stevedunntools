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
import { Trash2 } from "lucide-react";
import { fmt, parseNumNonNeg } from "@/lib/format";
import { Row, Separator, TotalRow } from "@/components/breakdown-table";
import DollarInput from "@/components/dollar-input";
import ResultsShell from "@/components/results-shell";
import { textFieldClass, selectFieldClass } from "@/lib/field-styles";
import MobileResultBar from "@/components/mobile-result-bar";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type LiquidatedType = "none" | "2x-wages" | "2x-wages-benefits" | "3x-wages";

const liquidatedOptions: { value: LiquidatedType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "2x-wages", label: "2× net back pay compensation (FLSA / ADEA / EPA)" },
  { value: "2x-wages-benefits", label: "2× net back pay compensation + benefits (FMLA)" },
  { value: "3x-wages", label: "3× net back pay compensation (state statutes)" },
];

interface MitigationJob {
  id: string;
  months: string;
  monthlyComp: string;
  /** Optional; offsets front pay alongside pay. Older saved sessions lack it. */
  monthlyBenefits?: string;
  current: boolean;
}

function makeJobId() {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EmploymentDamagesClient() {
  const hydrated = useHydrated();
  const [monthlyComp, setMonthlyComp] = useSessionState("tool:emp-damages:monthlyComp", "");
  const [monthlyBenefits, setMonthlyBenefits] = useSessionState("tool:emp-damages:monthlyBenefits", "");
  const [monthsSinceTermination, setMonthsSinceTermination] = useSessionState("tool:emp-damages:monthsSinceTermination", "");
  const [frontPayMonths, setFrontPayMonths] = useSessionState("tool:emp-damages:frontPayMonths", "");
  const [jobs, setJobs] = useSessionState<MitigationJob[]>("tool:emp-damages:jobs", [
    { id: makeJobId(), months: "", monthlyComp: "", monthlyBenefits: "", current: false },
  ]);
  const [compensatory, setCompensatory] = useSessionState("tool:emp-damages:compensatory", "");
  const [liquidatedType, setLiquidatedType] = useSessionState<LiquidatedType>("tool:emp-damages:liquidatedType", "none");
  const [punitive, setPunitive] = useSessionState("tool:emp-damages:punitive", "");
  const [otherDamages, setOtherDamages] = useSessionState("tool:emp-damages:otherDamages", "");

  function addJob() {
    setJobs([...jobs, { id: makeJobId(), months: "", monthlyComp: "", monthlyBenefits: "", current: false }]);
  }

  function updateJob(id: string, field: "months" | "monthlyComp" | "monthlyBenefits" | "current", value: string | boolean) {
    // Only one job can be the current one — the front-pay offset uses a single
    // current job, so checking a second box silently doing nothing would mislead.
    if (field === "current" && value === true) {
      setJobs(jobs.map((j) => ({ ...j, current: j.id === id })));
      return;
    }
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

  const comp = parseNumNonNeg(monthlyComp);
  const benefits = parseNumNonNeg(monthlyBenefits);
  const bpMonths = parseNumNonNeg(monthsSinceTermination);
  const fpMonths = parseNumNonNeg(frontPayMonths);
  const compDamages = parseNumNonNeg(compensatory);
  const pun = parseNumNonNeg(punitive);
  const other = parseNumNonNeg(otherDamages);

  // Back pay = (compensation + benefits) × months since termination
  const backPayComp = comp * bpMonths;
  const backPayBenefits = benefits * bpMonths;
  const backPay = backPayComp + backPayBenefits;

  // Mitigation = sum of all earnings from all jobs
  const totalMitigation = jobs.reduce(
    (sum, j) => sum + parseNumNonNeg(j.months) * (parseNumNonNeg(j.monthlyComp) + parseNumNonNeg(j.monthlyBenefits ?? "")),
    0
  );

  const netBackPay = Math.max(0, backPay - totalMitigation);

  // Front pay = months × (comp + benefits at termination - current job comp
  // if currently employed). Benefits are included, matching back pay.
  const currentJob = jobs.find((j) => j.current);
  const currentJobComp = currentJob ? parseNumNonNeg(currentJob.monthlyComp) + parseNumNonNeg(currentJob.monthlyBenefits ?? "") : 0;
  const frontPay = Math.max(0, comp + benefits - currentJobComp) * fpMonths;

  // Liquidated damages, computed on net (post-mitigation) back pay so the
  // multiplier reflects what is actually owed. Mitigation is allocated
  // proportionally between the wage and benefit components.
  const mitigationRatio = backPay > 0 ? netBackPay / backPay : 0;
  const netBackPayComp = backPayComp * mitigationRatio;
  let liquidated = 0;
  if (liquidatedType === "2x-wages") {
    liquidated = netBackPayComp;
  } else if (liquidatedType === "2x-wages-benefits") {
    liquidated = netBackPay;
  } else if (liquidatedType === "3x-wages") {
    liquidated = netBackPayComp * 2;
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
                <label
                  htmlFor="emp-damages-monthly-comp"
                  className="block text-sm font-medium text-brand-primary mb-1.5"
                >
                  Monthly compensation at termination
                </label>
                <DollarInput
                  id="emp-damages-monthly-comp"
                  value={monthlyComp}
                  onChange={setMonthlyComp}
                  placeholder="e.g. 7,000"
                />
              </div>
              <div>
                <label
                  htmlFor="emp-damages-monthly-benefits"
                  className="block text-sm font-medium text-brand-primary mb-1.5"
                >
                  Monthly benefits value
                </label>
                <DollarInput
                  id="emp-damages-monthly-benefits"
                  value={monthlyBenefits}
                  onChange={setMonthlyBenefits}
                  placeholder="e.g. 1,500"
                />
              </div>
            </div>
            <div className="max-w-[calc(50%-0.5rem)]">
              <label htmlFor="employment-damages-months-since-termination" className="block text-sm font-medium text-brand-primary mb-1.5">
                  Months since termination
                </label>
              <input
                id="employment-damages-months-since-termination"
                type="text"
                inputMode="numeric"
                value={monthsSinceTermination}
                onChange={(e) => setMonthsSinceTermination(e.target.value)}
                placeholder="e.g. 12"
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
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-primary">Job {idx + 1}</span>
                  {jobs.length > 1 && (
                    <button
                      onClick={() => removeJob(job.id)}
                      className="p-3 sm:p-1.5 -m-1 text-brand-muted hover:text-brand-error transition-colors print:hidden"
                      aria-label={`Remove job ${idx + 1}`}
                    >
                      <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <div>
                    <label htmlFor={`emp-damages-job-months-${job.id}`} className="block text-xs font-medium text-brand-muted mb-1">
                      Months employed
                    </label>
                    <input
                      id={`emp-damages-job-months-${job.id}`}
                      type="text"
                      inputMode="numeric"
                      value={job.months}
                      onChange={(e) => updateJob(job.id, "months", e.target.value)}
                      placeholder="e.g. 6"
                      className={textFieldClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`emp-damages-job-comp-${job.id}`}
                      className="block text-xs font-medium text-brand-muted mb-1"
                    >
                      Monthly compensation
                    </label>
                    <DollarInput
                      id={`emp-damages-job-comp-${job.id}`}
                      value={job.monthlyComp}
                      onChange={(v) => updateJob(job.id, "monthlyComp", v)}
                      placeholder="e.g. 5,000"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`emp-damages-job-benefits-${job.id}`}
                      className="block text-xs font-medium text-brand-muted mb-1"
                    >
                      Monthly benefits (optional)
                    </label>
                    <DollarInput
                      id={`emp-damages-job-benefits-${job.id}`}
                      value={job.monthlyBenefits ?? ""}
                      onChange={(v) => updateJob(job.id, "monthlyBenefits", v)}
                      placeholder="e.g. 800"
                    />
                  </div>
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
              <label htmlFor="employment-damages-months-of-front-pay" className="block text-sm font-medium text-brand-primary mb-1.5">
                  Months of front pay
                </label>
              <input
                id="employment-damages-months-of-front-pay"
                type="text"
                inputMode="numeric"
                value={frontPayMonths}
                onChange={(e) => setFrontPayMonths(e.target.value)}
                placeholder="e.g. 6"
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
              <label
                htmlFor="emp-damages-compensatory"
                className="block text-sm font-medium text-brand-primary mb-1.5"
              >
                Compensatory damages (emotional distress)
              </label>
              <DollarInput
                id="emp-damages-compensatory"
                value={compensatory}
                onChange={setCompensatory}
                placeholder="e.g. 50,000"
              />
            </div>

            <div>
              <label htmlFor="employment-damages-liquidated-damages" className="block text-sm font-medium text-brand-primary mb-1.5">
                  Liquidated damages
                </label>
              <select
                id="employment-damages-liquidated-damages"
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
              <label
                htmlFor="emp-damages-punitive"
                className="block text-sm font-medium text-brand-primary mb-1.5"
              >
                Punitive damages
              </label>
              <DollarInput
                id="emp-damages-punitive"
                value={punitive}
                onChange={setPunitive}
                placeholder="e.g. 0"
              />
            </div>

            <div>
              <label
                htmlFor="emp-damages-other"
                className="block text-sm font-medium text-brand-primary mb-1.5"
              >
                Other damages
              </label>
              <DollarInput
                id="emp-damages-other"
                value={otherDamages}
                onChange={setOtherDamages}
                placeholder="e.g. 0"
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

      <PrintInputs items={[
        { label: "Monthly compensation", value: monthlyComp ? "$" + monthlyComp : "" },
        { label: "Monthly benefits", value: monthlyBenefits ? "$" + monthlyBenefits : "" },
        { label: "Months since termination", value: monthsSinceTermination },
        { label: "Mitigation", value: jobs.filter((j) => j.months || j.monthlyComp).map((j, i) => `Job ${i + 1}: ${j.months || 0} mo at $${j.monthlyComp || 0}${j.monthlyBenefits ? ` + $${j.monthlyBenefits} benefits` : ""}${j.current ? " (current)" : ""}`).join("; ") },
        { label: "Months of front pay", value: frontPayMonths },
        { label: "Compensatory damages", value: compensatory ? "$" + compensatory : "" },
        { label: "Liquidated damages", value: liquidatedOptions.find((o) => o.value === liquidatedType)?.label },
        { label: "Punitive damages", value: punitive ? "$" + punitive : "" },
        { label: "Other damages", value: otherDamages ? "$" + otherDamages : "" },
      ]} />
      {/* Results */}
      <div className="lg:col-span-2">
        <ResultsShell
          label="Estimated Total Damages"
          value={hydrated && hasAny ? fmt(grossTotal) : "—"}
        >
          {/* Breakdown */}
          <Card className="bg-white border-brand-border">
            <CardHeader>
              <CardTitle className="text-brand-primary text-base">Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <tbody>
                  <Row label="Back pay (compensation)" value={hydrated && hasAny ? backPayComp : "—"} />
                  <Row label="Back pay (benefits)" value={hydrated && hasAny ? backPayBenefits : "—"} />
                  <Row label="Gross back pay" value={hydrated && hasAny ? backPay : "—"} bold />
                  <Row label="Less: mitigation" value={hydrated && hasAny ? totalMitigation : "—"} negative />
                  <Row label="Net back pay" value={hydrated && hasAny ? netBackPay : "—"} bold />
                  {hydrated && totalMitigation > backPay && backPay > 0 && (
                    <tr>
                      <td colSpan={2} className="pb-2 text-xs text-brand-muted">
                        Mitigation exceeds gross back pay; net back pay is
                        floored at $0 and the excess does not offset other
                        damages.
                      </td>
                    </tr>
                  )}
                  <Separator />
                  <Row label="Front pay" value={hydrated && hasAny ? frontPay : "—"} />
                  <Separator />
                  <Row label="Compensatory damages" value={hydrated && hasAny ? compDamages : "—"} />
                  <Row label="Liquidated damages" value={hydrated && hasAny ? liquidated : "—"} />
                  <Row label="Punitive damages" value={hydrated && hasAny ? pun : "—"} />
                  <Row label="Other damages" value={hydrated && hasAny ? other : "—"} />
                  <Separator />
                  <TotalRow label="Total" value={hydrated && hasAny ? fmt(grossTotal) : "—"} />
                </tbody>
              </table>
            </CardContent>
          </Card>
        </ResultsShell>
      </div>
      <MobileResultBar label="Total damages" value={hydrated && hasAny ? fmt(grossTotal) : "—"} />
    </div>
  );
}
