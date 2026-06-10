"use client";

import { useMemo, useEffect } from "react";
import { useSessionState, clearSessionKeys } from "@/lib/use-session-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { fmt, parseNum, commaFmt } from "@/lib/format";
import DollarInput from "@/components/dollar-input";
import PercentSlider from "@/components/percent-slider";
import ExportPdfButton from "@/components/export-pdf-button";
import { textFieldClass as inputClass, selectFieldClass as selectClass } from "@/lib/field-styles";
import {
  buildSchedule,
  Frequency,
  InterestScope,
  InterestStart,
  InstallmentMode,
} from "./schedule";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UpfrontPayment {
  id: string;
  amount: string;
  timing: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeId() {
  return crypto.randomUUID();
}


// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PaymentOverTimeClient() {
  const [totalSettlement, setTotalSettlement] = useSessionState("tool:payment-time:totalSettlement", "");
  const [upfronts, setUpfronts] = useSessionState<UpfrontPayment[]>("tool:payment-time:upfronts", [
    { id: makeId(), amount: "", timing: "At signing" },
  ]);
  const [numPayments, setNumPayments] = useSessionState("tool:payment-time:numPayments", "");
  const [installmentAmount, setInstallmentAmount] = useSessionState("tool:payment-time:installmentAmount", "");
  const [frequency, setFrequency] = useSessionState<Frequency>("tool:payment-time:frequency", "monthly");
  const [customIntervalDays, setCustomIntervalDays] = useSessionState("tool:payment-time:customIntervalDays", "");
  const [interestScope, setInterestScope] = useSessionState<InterestScope>("tool:payment-time:interestScope", "none");
  const [interestStart, setInterestStart] = useSessionState<InterestStart>("tool:payment-time:interestStart", "first-installment");
  const [annualRate, setAnnualRate] = useSessionState("tool:payment-time:annualRate", 5);

  // Track which field the user last edited to determine calculation direction
  const [installmentMode, setInstallmentMode] = useSessionState<InstallmentMode>("tool:payment-time:installmentMode", "count");

  // Migrate legacy "all" scope (removed) → "installments"
  useEffect(() => {
    if ((interestScope as string) === "all") setInterestScope("installments");
  }, [interestScope, setInterestScope]);

  function addUpfront() {
    setUpfronts([...upfronts, { id: makeId(), amount: "", timing: "" }]);
  }

  function updateUpfront(id: string, field: "amount" | "timing", value: string) {
    setUpfronts(upfronts.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  }

  function removeUpfront(id: string) {
    setUpfronts(upfronts.filter((u) => u.id !== id));
  }

  function clearAll() {
    setTotalSettlement("");
    setUpfronts([{ id: makeId(), amount: "", timing: "At signing" }]);
    setNumPayments("");
    setInstallmentAmount("");
    setInstallmentMode("count");
    setFrequency("monthly");
    setCustomIntervalDays("");
    setInterestScope("none");
    setInterestStart("first-installment");
    setAnnualRate(5);
    clearSessionKeys("tool:payment-time:");
  }

  // ---------------------------------------------------------------------------
  // Calculation — driven directly by live state. No deferred-commit layer.
  // ---------------------------------------------------------------------------

  const { schedule, summary, calculatedPayment, calculatedCount, warnings } = useMemo(
    () =>
      buildSchedule({
        totalSettlement: parseNum(totalSettlement),
        upfronts: upfronts.map((u) => ({ amount: parseNum(u.amount), timing: u.timing })),
        numPayments: parseNum(numPayments),
        installmentAmount: parseNum(installmentAmount),
        installmentMode,
        frequency,
        customIntervalDays: parseNum(customIntervalDays),
        interestScope,
        interestStart,
        annualRate,
      }),
    [
      totalSettlement,
      upfronts,
      numPayments,
      installmentAmount,
      installmentMode,
      frequency,
      customIntervalDays,
      interestScope,
      interestStart,
      annualRate,
    ]
  );

  // Show Clear button whenever any persisted state differs from defaults
  const upfrontsAreDefault =
    upfronts.length === 1 &&
    upfronts[0].amount === "" &&
    upfronts[0].timing === "At signing";
  const hasAny =
    totalSettlement !== "" ||
    numPayments !== "" ||
    installmentAmount !== "" ||
    customIntervalDays !== "" ||
    installmentMode !== "count" ||
    frequency !== "monthly" ||
    interestScope !== "none" ||
    interestStart !== "first-installment" ||
    annualRate !== 5 ||
    !upfrontsAreDefault;

  return (
    <div className="space-y-6">
      {/* Settlement + Interest row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Settlement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="block text-sm font-medium text-brand-primary mb-1.5">
              Total settlement amount
            </label>
            <DollarInput
              value={totalSettlement}
              onChange={setTotalSettlement}
              placeholder="250,000"
            />
          </CardContent>
        </Card>

        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Interest
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Interest applies to
              </label>
              <select
                value={interestScope}
                onChange={(e) => setInterestScope(e.target.value as InterestScope)}
                className={selectClass}
              >
                <option value="none">None (0% interest)</option>
                <option value="installments">Installments only</option>
              </select>
            </div>
            {interestScope !== "none" && (
              <>
                <PercentSlider
                  value={annualRate}
                  onChange={setAnnualRate}
                  min={1}
                  max={20}
                  allowOverflow
                  label="Annual interest rate"
                />
                <div>
                  <label className="block text-sm font-medium text-brand-primary mb-1.5">
                    Interest starts
                  </label>
                  <select
                    value={interestStart}
                    onChange={(e) => setInterestStart(e.target.value as InterestStart)}
                    className={selectClass}
                  >
                    <option value="first-installment">With first installment</option>
                    <option value="immediately">Immediately</option>
                  </select>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Up-front payments */}
      <Card className="bg-white border-brand-border print:hidden">
        <CardHeader>
          <CardTitle className="text-brand-primary text-base">
            Up-Front Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upfronts.map((u, idx) => (
            <div key={u.id} className="grid grid-cols-[1fr_1fr_auto] gap-3">
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Amount
                </label>
                <DollarInput
                  value={u.amount}
                  onChange={(v) => updateUpfront(u.id, "amount", v)}
                  placeholder="25,000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Timing
                </label>
                <input
                  type="text"
                  value={u.timing}
                  onChange={(e) => updateUpfront(u.id, "timing", e.target.value)}
                  placeholder="At signing"
                  className={inputClass}
                />
              </div>
              <button
                onClick={() => removeUpfront(u.id)}
                className="sm:mt-5 p-3 sm:p-2 text-brand-muted hover:text-brand-error transition-colors"
                aria-label={`Remove up-front payment ${idx + 1}`}
              >
                <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
              </button>
            </div>
          ))}
          <Button variant="outline" onClick={addUpfront} className="w-full">
            Add Up-Front Payment
          </Button>
        </CardContent>
      </Card>

      {/* Installments */}
      <Card className="bg-white border-brand-border print:hidden">
        <CardHeader>
          <CardTitle className="text-brand-primary text-base">
            Installments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Number of payments
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={installmentMode === "amount" && calculatedCount > 0 ? calculatedCount.toString() : numPayments}
                onChange={(e) => {
                  setNumPayments(e.target.value.replace(/[^0-9]/g, ""));
                  setInstallmentMode("count");
                }}
                placeholder="12"
                className={`${inputClass} ${installmentMode === "amount" && calculatedCount > 0 ? "bg-brand-bg border-brand-accent/40" : ""}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Payment amount
              </label>
              <DollarInput
                value={installmentMode === "count" && calculatedPayment > 0 ? commaFmt(Math.round(calculatedPayment).toString()) : installmentAmount}
                onChange={(v) => {
                  setInstallmentAmount(v);
                  setInstallmentMode("amount");
                }}
                placeholder="10,000"
                className={`w-full pl-7 pr-3 py-2 text-sm border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent ${installmentMode === "count" && calculatedPayment > 0 ? "bg-brand-bg border-brand-accent/40" : "border-brand-border"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
                className={selectClass}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="custom">Custom interval</option>
              </select>
            </div>
          </div>
          {frequency === "custom" && (
            <div className="max-w-[calc(33.333%-0.67rem)]">
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Interval (days)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={customIntervalDays}
                onChange={(e) => setCustomIntervalDays(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="60"
                className={inputClass}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {hasAny && (
        <div className="print:hidden">
          <Button variant="outline" onClick={clearAll}>
            Clear data
          </Button>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-2 print:hidden">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-sm text-amber-900"
            >
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Schedule */}
      {schedule.length > 0 && (
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Payment Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-left">
                    <th className="pb-2 pr-3 font-medium text-brand-muted">Payment</th>
                    <th className="pb-2 pr-3 font-medium text-brand-muted text-right">Amount</th>
                    {summary.totalInterest > 0 && (
                      <>
                        <th className="pb-2 pr-3 font-medium text-brand-muted text-right">Principal</th>
                        <th className="pb-2 pr-3 font-medium text-brand-muted text-right">Interest</th>
                      </>
                    )}
                    <th className="pb-2 font-medium text-brand-muted text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row, i) => (
                    <tr key={i} className="border-b border-brand-border/50">
                      <td className="py-2 pr-3 text-brand-primary">{row.label}</td>
                      <td className="py-2 pr-3 text-right text-brand-primary font-medium tabular-nums">
                        {row.payment > 0 ? fmt(row.payment) : "—"}
                      </td>
                      {summary.totalInterest > 0 && (
                        <>
                          <td className="py-2 pr-3 text-right text-brand-muted tabular-nums">
                            {row.principal > 0 ? fmt(row.principal) : "—"}
                          </td>
                          <td className="py-2 pr-3 text-right text-brand-muted tabular-nums">
                            {row.interest > 0 ? fmt(row.interest) : "—"}
                          </td>
                        </>
                      )}
                      <td className="py-2 text-right text-brand-muted tabular-nums">
                        {fmt(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-brand-border grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-brand-muted">Total paid</p>
                <p className="font-semibold text-brand-primary">{fmt(summary.totalPaid)}</p>
              </div>
              {summary.totalInterest > 0 && (
                <div>
                  <p className="text-brand-muted">Total interest</p>
                  <p className="font-semibold text-brand-primary">{fmt(summary.totalInterest)}</p>
                </div>
              )}
              <div>
                <p className="text-brand-muted">Settlement amount</p>
                <p className="font-semibold text-brand-primary">{fmt(summary.totalSettlement)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {schedule.length > 0 && (
        <div className="print:hidden">
          <ExportPdfButton />
        </div>
      )}
    </div>
  );
}
