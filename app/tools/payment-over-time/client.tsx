"use client";

import { useMemo } from "react";
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
type InterestScope = "all" | "installments" | "none";
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

  const [committed, setCommitted] = useSessionState("tool:payment-time:committed", {
    totalSettlement: "",
    upfronts: [] as UpfrontPayment[],
    numPayments: "",
    installmentAmount: "",
    installmentMode: "count" as "count" | "amount",
    frequency: "monthly" as Frequency,
    customIntervalDays: "",
    interestScope: "none" as InterestScope,
    interestStart: "first-installment" as InterestStart,
    annualRate: 5,
  });

  function commit() {
    setCommitted({
      totalSettlement,
      upfronts: upfronts.map((u) => ({ ...u })),
      numPayments,
      installmentAmount,
      installmentMode,
      frequency,
      customIntervalDays,
      interestScope,
      interestStart,
      annualRate,
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commit();
  }

  function addUpfront() {
    setUpfronts([...upfronts, { id: makeId(), amount: "", timing: "" }]);
  }

  function updateUpfront(id: string, field: "amount" | "timing", value: string) {
    setUpfronts(upfronts.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  }

  function removeUpfront(id: string) {
    const updated = upfronts.filter((u) => u.id !== id);
    setUpfronts(updated);
    setCommitted((prev) => ({ ...prev, upfronts: updated }));
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
    setCommitted({
      totalSettlement: "",
      upfronts: [],
      numPayments: "",
      installmentAmount: "",
      installmentMode: "count",
      frequency: "monthly",
      customIntervalDays: "",
      interestScope: "none",
      interestStart: "first-installment",
      annualRate: 5,
    });
    clearSessionKeys("tool:payment-time:");
  }

  // ---------------------------------------------------------------------------
  // Calculation
  // ---------------------------------------------------------------------------

  const { schedule, summary, calculatedPayment, calculatedCount } = useMemo(() => {
    const total = parseNum(committed.totalSettlement);
    const scope = committed.interestScope;
    const startTiming = committed.interestStart;
    const rate = committed.annualRate / 100;
    const freq = committed.frequency;

    // Determine periods per year
    let periodsPerYear = 12;
    if (freq === "quarterly") periodsPerYear = 4;
    else if (freq === "custom") {
      const days = parseNum(committed.customIntervalDays);
      periodsPerYear = days > 0 ? 365 / days : 12;
    }

    const periodRate = scope !== "none" ? rate / periodsPerYear : 0;

    // Period label
    let periodLabel = "Month";
    if (freq === "quarterly") periodLabel = "Quarter";
    else if (freq === "custom") periodLabel = "Payment";

    const rows: ScheduleRow[] = [];
    let balance = total;
    let totalInterest = 0;
    let totalPaid = 0;

    // Up-front payments
    const upfrontCount = committed.upfronts.filter((u) => parseNum(u.amount) > 0).length;
    for (const u of committed.upfronts) {
      const amt = parseNum(u.amount);
      if (amt <= 0) continue;

      let interest = 0;
      if (scope === "all" && periodRate > 0) {
        interest = balance * periodRate;
      }

      const principal = amt;
      const payment = principal + interest;
      balance = Math.max(0, balance - principal);
      totalInterest += interest;
      totalPaid += payment;

      rows.push({
        label: u.timing || "Up front",
        payment,
        principal,
        interest,
        balance,
      });
    }

    // If interest starts immediately but scope is installments-only,
    // accrue interest during the up-front period and roll into balance
    if (scope === "installments" && startTiming === "immediately" && upfrontCount > 0 && periodRate > 0) {
      const accruedInterest = balance * periodRate * upfrontCount;
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
    const mode = committed.installmentMode;
    let n = Math.round(parseNum(committed.numPayments));
    let fixedPayment = parseNum(committed.installmentAmount);
    const installmentRate = scope !== "none" ? periodRate : 0;

    let calcPayment = 0;
    let calcCount = 0;

    if (balance > 0) {
      if (mode === "count" && n > 0) {
        // Calculate payment from count
        if (installmentRate > 0) {
          fixedPayment = (balance * installmentRate) / (1 - Math.pow(1 + installmentRate, -n));
        } else {
          fixedPayment = balance / n;
        }
        calcPayment = fixedPayment;
        calcCount = n;
      } else if (mode === "amount" && fixedPayment > 0) {
        // Calculate count from payment amount
        if (installmentRate > 0) {
          const minPayment = balance * installmentRate;
          if (fixedPayment <= minPayment) {
            // Payment too small to cover interest
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

      // Generate installment rows
      for (let i = 1; i <= n; i++) {
        if (balance <= 0) break;

        const interest = balance * installmentRate;
        let principal: number;
        let payment: number;

        if (i === n) {
          // Last payment: pay off remaining balance
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
    };
  }, [committed]);

  const hasAny =
    totalSettlement !== "" ||
    upfronts.some((u) => u.amount !== "") ||
    numPayments !== "" ||
    installmentAmount !== "";

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
              onCommit={commit}
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
                onChange={(e) => {
                  const val = e.target.value as InterestScope;
                  setInterestScope(val);
                  setCommitted((prev) => ({ ...prev, interestScope: val }));
                }}
                className={selectClass}
              >
                <option value="none">None (0% interest)</option>
                <option value="installments">Installments only</option>
                <option value="all">All payments</option>
              </select>
            </div>
            {interestScope !== "none" && (
              <>
                <PercentSlider
                  value={annualRate}
                  onChange={(val) => {
                    setAnnualRate(val);
                    setCommitted((prev) => ({ ...prev, annualRate: val }));
                  }}
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
                    onChange={(e) => {
                      const val = e.target.value as InterestStart;
                      setInterestStart(val);
                      setCommitted((prev) => ({ ...prev, interestStart: val }));
                    }}
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
                  onCommit={commit}
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
                  onBlur={commit}
                  onKeyDown={handleKeyDown}
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
                  setNumPayments(e.target.value);
                  setInstallmentMode("count");
                }}
                onBlur={commit}
                onKeyDown={handleKeyDown}
                placeholder="12"
                className={`${inputClass} ${installmentMode === "amount" && calculatedCount > 0 ? "bg-brand-bg border-brand-accent/40" : ""}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Payment amount
              </label>
              <DollarInput
                value={installmentMode === "count" && calculatedPayment > 0 ? Math.round(calculatedPayment).toString() : installmentAmount}
                onChange={(v) => {
                  setInstallmentAmount(v);
                  setInstallmentMode("amount");
                }}
                onCommit={commit}
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
                onChange={(e) => {
                  const val = e.target.value as Frequency;
                  setFrequency(val);
                  setCommitted((prev) => ({ ...prev, frequency: val }));
                }}
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
                onChange={(e) => setCustomIntervalDays(e.target.value)}
                onBlur={commit}
                onKeyDown={handleKeyDown}
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
            Clear All
          </Button>
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
