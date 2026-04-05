"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { setToolValue } from "@/lib/tool-store";
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

const monthInputClass =
  "w-full px-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EmploymentDamagesClient() {
  const [monthlyComp, setMonthlyComp] = useState("");
  const [monthlyBenefits, setMonthlyBenefits] = useState("");
  const [monthsSinceTermination, setMonthsSinceTermination] = useState("");
  const [frontPayMonths, setFrontPayMonths] = useState("");
  const [jobs, setJobs] = useState<MitigationJob[]>([
    { id: makeJobId(), months: "", monthlyComp: "", current: false },
  ]);
  const [compensatory, setCompensatory] = useState("");
  const [liquidatedType, setLiquidatedType] = useState<LiquidatedType>("none");
  const [punitive, setPunitive] = useState("");
  const [otherDamages, setOtherDamages] = useState("");

  const [committed, setCommitted] = useState({
    monthlyComp: "",
    monthlyBenefits: "",
    monthsSinceTermination: "",
    frontPayMonths: "",
    jobs: [] as MitigationJob[],
    compensatory: "",
    liquidatedType: "none" as LiquidatedType,
    punitive: "",
    otherDamages: "",
  });

  function commit() {
    setCommitted({
      monthlyComp,
      monthlyBenefits,
      monthsSinceTermination,
      frontPayMonths,
      jobs: jobs.map((j) => ({ ...j })),
      compensatory,
      liquidatedType,
      punitive,
      otherDamages,
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commit();
  }

  function addJob() {
    setJobs([...jobs, { id: makeJobId(), months: "", monthlyComp: "", current: false }]);
  }

  function updateJob(id: string, field: "months" | "monthlyComp" | "current", value: string | boolean) {
    setJobs(jobs.map((j) => (j.id === id ? { ...j, [field]: value } : j)));
  }

  function removeJob(id: string) {
    const updated = jobs.filter((j) => j.id !== id);
    setJobs(updated);
    setCommitted((prev) => ({ ...prev, jobs: updated }));
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
    setCommitted({
      monthlyComp: "",
      monthlyBenefits: "",
      monthsSinceTermination: "",
      frontPayMonths: "",
      jobs: [],
      compensatory: "",
      liquidatedType: "none",
      punitive: "",
      otherDamages: "",
    });
  }

  const calc = useMemo(() => {
    const comp = parseNum(committed.monthlyComp);
    const benefits = parseNum(committed.monthlyBenefits);
    const bpMonths = parseNum(committed.monthsSinceTermination);
    const fpMonths = parseNum(committed.frontPayMonths);
    const compDamages = parseNum(committed.compensatory);
    const pun = parseNum(committed.punitive);
    const other = parseNum(committed.otherDamages);

    // Back pay = (compensation + benefits) × months since termination
    const backPayComp = comp * bpMonths;
    const backPayBenefits = benefits * bpMonths;
    const backPay = backPayComp + backPayBenefits;

    // Mitigation = sum of all earnings from all jobs
    const totalMitigation = committed.jobs.reduce((sum, j) => {
      return sum + parseNum(j.months) * parseNum(j.monthlyComp);
    }, 0);

    const netBackPay = Math.max(0, backPay - totalMitigation);

    // Front pay = months × (comp at termination - current job comp if currently employed)
    const currentJob = committed.jobs.find((j) => j.current);
    const currentJobComp = currentJob ? parseNum(currentJob.monthlyComp) : 0;
    const frontPayMonthly = Math.max(0, comp - currentJobComp);
    const frontPay = frontPayMonthly * fpMonths;

    // Liquidated damages (based on back pay only, before mitigation)
    let liquidated = 0;
    const liqType = committed.liquidatedType;
    if (liqType === "2x-wages") {
      liquidated = backPayComp;
    } else if (liqType === "2x-wages-benefits") {
      liquidated = backPay;
    } else if (liqType === "3x-wages") {
      liquidated = backPayComp * 2;
    }

    const grossTotal = netBackPay + frontPay + compDamages + liquidated + pun + other;

    return {
      backPayComp,
      backPayBenefits,
      backPay,
      totalMitigation,
      netBackPay,
      frontPay,
      compensatory: compDamages,
      liquidated,
      punitive: pun,
      other,
      grossTotal,
    };
  }, [committed]);

  // Share total with other tools (e.g. expected value calculator)
  useEffect(() => {
    setToolValue("employment-damages-estimator.total", calc.grossTotal);
  }, [calc.grossTotal]);

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
      <div className="lg:col-span-3 space-y-6">
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
                  onCommit={commit}
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
                  onCommit={commit}
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
                onBlur={commit}
                onKeyDown={handleKeyDown}
                placeholder="12"
                className={monthInputClass}
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
                <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                  <div>
                    <label className="block text-xs font-medium text-brand-muted mb-1">
                      Months employed
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={job.months}
                      onChange={(e) => updateJob(job.id, "months", e.target.value)}
                      onBlur={commit}
                      onKeyDown={handleKeyDown}
                      placeholder="6"
                      className={monthInputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-muted mb-1">
                      Monthly compensation
                    </label>
                    <DollarInput
                      value={job.monthlyComp}
                      onChange={(v) => updateJob(job.id, "monthlyComp", v)}
                      onCommit={commit}
                      placeholder="5,000"
                    />
                  </div>
                  <button
                    onClick={() => removeJob(job.id)}
                    className="p-2 text-brand-muted hover:text-brand-error transition-colors mb-0.5"
                    aria-label={`Remove job ${idx + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={job.current}
                    onChange={(e) => {
                      const updatedJobs = jobs.map((j) =>
                        j.id === job.id ? { ...j, current: e.target.checked } : j
                      );
                      setJobs(updatedJobs);
                      setCommitted((prev) => ({ ...prev, jobs: updatedJobs }));
                    }}
                    className="h-4 w-4 rounded border-brand-border text-brand-accent focus:ring-brand-accent"
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
                onBlur={commit}
                onKeyDown={handleKeyDown}
                placeholder="6"
                className={monthInputClass}
              />
              <p className="mt-1 text-xs text-brand-muted">
                Compensation only, reduced by current job compensation if applicable
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
                onCommit={commit}
                placeholder="50,000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Liquidated damages
              </label>
              <select
                value={liquidatedType}
                onChange={(e) => {
                  setLiquidatedType(e.target.value as LiquidatedType);
                  setTimeout(() => {
                    setCommitted((prev) => ({
                      ...prev,
                      liquidatedType: e.target.value as LiquidatedType,
                    }));
                  }, 0);
                }}
                className="w-full px-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
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
                onCommit={commit}
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
                onCommit={commit}
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
          <Card className="bg-white border-brand-accent">
            <CardContent className="pt-6">
              <p className="text-sm text-brand-muted mb-1">Estimated Total Damages</p>
              <p className="text-3xl font-bold text-brand-accent">
                {fmt(calc.grossTotal)}
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
                  <Row label="Back pay (compensation)" value={calc.backPayComp} />
                  <Row label="Back pay (benefits)" value={calc.backPayBenefits} />
                  <Row label="Gross back pay" value={calc.backPay} bold />
                  <Row label="Less: mitigation" value={-calc.totalMitigation} negative />
                  <Row label="Net back pay" value={calc.netBackPay} bold />
                  <Separator />
                  <Row label="Front pay" value={calc.frontPay} />
                  <Separator />
                  <Row label="Compensatory damages" value={calc.compensatory} />
                  <Row label="Liquidated damages" value={calc.liquidated} />
                  <Row label="Punitive damages" value={calc.punitive} />
                  <Row label="Other damages" value={calc.other} />
                  <Separator />
                  <tr>
                    <td className="py-2 font-semibold text-brand-primary">Total</td>
                    <td className="py-2 text-right font-semibold text-brand-accent">
                      {fmt(calc.grossTotal)}
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
