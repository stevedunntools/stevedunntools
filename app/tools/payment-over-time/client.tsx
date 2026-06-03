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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UpfrontPayment {
  id: string;
  amount: string;
  timing: string;
}

type Frequency = "monthly" | "quarterly" | "custom";
type InterestScope = "installments" | "none";
type InterestStart = "immediately" | "first-installment";

interface ScheduleRow {
  label: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeId() {
  return crypto.randomUUID();
}

const inputClass =
  "w-full px-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

const selectClass =
  "w-full px-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

const noop = () => {};

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
  const [installmentMode, setInstallmentMode] = useSessionState<"count" | "amount">("tool:payment-time:installmentMode", "count");

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

  const { schedule, summary, calculatedPayment, calculatedCount, warnings } = useMemo(() => {
    const total = parseNum(totalSettlement);
    const scope = interestScope;
    const startTiming = interestStart;
    const rate = annualRate / 100;
    const freq = frequency;

    let periodsPerYear = 12;
    if (freq === "quarterly") periodsPerYear = 4;
    else if (freq === "custom") {
      const days = parseNum(customIntervalDays);
      periodsPerYear = days > 0 ? 365 / days : 12;
    }

    const periodRate = scope !== "none" ? rate / periodsPerYear : 0;

    let periodLabel = "Month";
    if (freq === "quarterly") periodLabel = "Quarter";
    else if (freq === "custom") periodLabel = "Payment";

    const rows: ScheduleRow[] = [];
    let balance = total;
    let totalInterest = 0;
    let totalPaid = 0;
    const warnings: string[] = [];

    // Flag (but still process) upfronts whose total exceeds the settlement
    const upfrontTotal = upfronts.reduce(
      (sum, u) => sum + Math.max(0, parseNum(u.amount)),
      0
    );
    if (total > 0 && upfrontTotal > total + 0.005) {
      warnings.push(
        `Up-front payments (${fmt(upfrontTotal)}) exceed the settlement total (${fmt(total)}). The excess is not included in the schedule.`
      );
    }

    // Up-front payments — treated as occurring at T=0 (no interest accrual).
    // Each upfront's principal is clamped to whatever balance remains.
    const upfrontCount = upfronts.filter((u) => parseNum(u.amount) > 0).length;
    for (const u of upfronts) {
      const requested = parseNum(u.amount);
      if (requested <= 0) continue;

      const principal = Math.min(requested, balance);
      if (principal <= 0) continue;
      const payment = principal;
      balance = Math.max(0, balance - principal);
      totalPaid += payment;

      rows.push({
        label: u.timing || "Up front",
        payment,
        principal,
        interest: 0,
        balance,
      });
    }

    // If interest starts immediately, accrue one period of interest on the
    // post-upfront balance before installments begin.
    if (scope === "installments" && startTiming === "immediately" && upfrontCount > 0 && periodRate > 0) {
      const accruedInterest = balance * periodRate;
      balance += accruedInterest;
      totalInterest += accruedInterest;

      rows.push({
        label: "Accrued interest",
        payment: 0,
        principal: 0,
        interest: accruedInterest,
        balance,
      });
    }

    // Determine installment count and payment amount
    const mode = installmentMode;
    let n = Math.round(parseNum(numPayments));
    let fixedPayment = parseNum(installmentAmount);
    const installmentRate = scope !== "none" ? periodRate : 0;

    let calcPayment = 0;
    let calcCount = 0;

    if (balance > 0) {
      if (mode === "count" && n > 0) {
        if (installmentRate > 0) {
          fixedPayment = (balance * installmentRate) / (1 - Math.pow(1 + installmentRate, -n));
        } else {
          fixedPayment = balance / n;
        }
        calcPayment = fixedPayment;
        calcCount = n;
      } else if (mode === "amount" && fixedPayment > 0) {
        if (installmentRate > 0) {
          const minPayment = balance * installmentRate;
          if (fixedPayment <= minPayment) {
            warnings.push(
              `Payment amount (${fmt(fixedPayment)}) is at or below the interest accrued per period (${fmt(minPayment)}). Increase the payment or lower the rate to produce a schedule.`
            );
            n = 0;
          } else {
            n = Math.ceil(
              -Math.log(1 - (balance * installmentRate) / fixedPayment) /
                Math.log(1 + installmentRate)
            );
          }
        } else {
          n = Math.ceil(balance / fixedPayment);
        }
        calcPayment = fixedPayment;
        calcCount = n;
      }

      for (let i = 1; i <= n; i++) {
        if (balance <= 0) break;

        const interest = balance * installmentRate;
        let principal: number;
        let payment: number;

        if (i === n) {
          principal = balance;
          payment = principal + interest;
        } else {
          payment = fixedPayment;
          principal = payment - interest;
        }

        balance = Math.max(0, balance - principal);
        totalInterest += interest;
        totalPaid += payment;

        rows.push({
          label: `${periodLabel} ${i}`,
          payment,
          principal,
          interest,
          balance: Math.max(0, balance),
        });
      }
    }

    return {
      schedule: rows,
      summary: {
        totalSettlement: total,
        totalPaid,
        totalInterest,
      },
      calculatedPayment: calcPayment,
      calculatedCount: calcCount,
      warnings,
    };
  }, [
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
  ]);

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
              onCommit={noop}
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
                  onCommit={noop}
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
                onCommit={noop}
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
