"use client";

import ClearAllButton from "@/components/clear-all-button";
import ToolCard from "@/components/tool-card";
import PrintInputs from "@/components/print-inputs";
import { useMemo, useEffect } from "react";
import { useSessionState, clearSessionKeys, useHydrated } from "@/lib/use-session-state";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { fmt, parseNumNonNeg, commaFmtNum } from "@/lib/format";
import DollarInput from "@/components/dollar-input";
import PercentSlider from "@/components/percent-slider";
import ExportPdfButton from "@/components/export-pdf-button";
import { textFieldClass as inputClass, selectFieldClass as selectClass } from "@/lib/field-styles";
import MobileResultBar from "@/components/mobile-result-bar";
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
  /** Days after the agreement date; "" or "0" = at signing. */
  days?: string;
  /** Legacy free-text label from sessions saved before timing became numeric. */
  timing?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeId() {
  return crypto.randomUUID();
}

const defaultUpfront = (): UpfrontPayment => ({ id: makeId(), amount: "", days: "" });

function digitsOnly(s: string) {
  return s.replace(/[^0-9]/g, "");
}

function periodWord(frequency: Frequency, intervalDays: number) {
  if (frequency === "monthly") return { one: "one month", each: "month" };
  if (frequency === "quarterly") return { one: "one quarter", each: "quarter" };
  return { one: `${intervalDays} days`, each: `${intervalDays}-day interval` };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PaymentOverTimeClient() {
  const hydrated = useHydrated();
  const [totalSettlement, setTotalSettlement] = useSessionState("tool:payment-time:totalSettlement", "");
  const [upfronts, setUpfronts] = useSessionState<UpfrontPayment[]>("tool:payment-time:upfronts", [defaultUpfront()]);
  const [numPayments, setNumPayments] = useSessionState("tool:payment-time:numPayments", "");
  const [installmentAmount, setInstallmentAmount] = useSessionState("tool:payment-time:installmentAmount", "");
  const [frequency, setFrequency] = useSessionState<Frequency>("tool:payment-time:frequency", "monthly");
  const [customIntervalDays, setCustomIntervalDays] = useSessionState("tool:payment-time:customIntervalDays", "");
  const [interestScope, setInterestScope] = useSessionState<InterestScope>("tool:payment-time:interestScope", "none");
  const [annualRate, setAnnualRate] = useSessionState("tool:payment-time:annualRate", 5);
  const [interestStart, setInterestStart] = useSessionState<InterestStart>("tool:payment-time:interestStart", "agreement");
  const [interestStartDays, setInterestStartDays] = useSessionState("tool:payment-time:interestStartDays", "");

  // Track which field the user last edited to determine calculation direction
  const [installmentMode, setInstallmentMode] = useSessionState<InstallmentMode>("tool:payment-time:installmentMode", "count");

  // Migrate legacy "all" scope (removed) → "installments"
  useEffect(() => {
    if ((interestScope as string) === "all") setInterestScope("installments");
  }, [interestScope, setInterestScope]);

  function addUpfront() {
    setUpfronts([...upfronts, defaultUpfront()]);
  }

  function updateUpfront(id: string, field: "amount" | "days", value: string) {
    setUpfronts(upfronts.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  }

  function removeUpfront(id: string) {
    setUpfronts(upfronts.filter((u) => u.id !== id));
  }

  function clearAll() {
    setTotalSettlement("");
    setUpfronts([defaultUpfront()]);
    setNumPayments("");
    setInstallmentAmount("");
    setInstallmentMode("count");
    setFrequency("monthly");
    setCustomIntervalDays("");
    setInterestScope("none");
    setAnnualRate(5);
    setInterestStart("agreement");
    setInterestStartDays("");
    clearSessionKeys("tool:payment-time:");
  }

  // ---------------------------------------------------------------------------
  // Calculation — driven directly by live state. No deferred-commit layer.
  // ---------------------------------------------------------------------------

  const { schedule, summary, calculatedPayment, calculatedCount, periodDays, interestBeginsDay, warnings } = useMemo(
    () =>
      buildSchedule({
        totalSettlement: parseNumNonNeg(totalSettlement),
        upfronts: upfronts.map((u) => ({ amount: parseNumNonNeg(u.amount), days: parseNumNonNeg(u.days ?? "") })),
        numPayments: parseNumNonNeg(numPayments),
        installmentAmount: parseNumNonNeg(installmentAmount),
        installmentMode: installmentMode === "amount" && parseNumNonNeg(installmentAmount) <= 0 ? "count" : installmentMode,
        frequency,
        customIntervalDays: parseNumNonNeg(customIntervalDays),
        interestScope,
        annualRate,
        interestStart,
        interestStartDays: parseNumNonNeg(interestStartDays),
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
      annualRate,
      interestStart,
      interestStartDays,
    ]
  );

  // Show Clear button whenever any persisted state differs from defaults
  const upfrontsAreDefault =
    upfronts.length === 1 && upfronts[0].amount === "" && !upfronts[0].days;
  const hasAny =
    totalSettlement !== "" ||
    numPayments !== "" ||
    installmentAmount !== "" ||
    customIntervalDays !== "" ||
    installmentMode !== "count" ||
    frequency !== "monthly" ||
    interestScope !== "none" ||
    annualRate !== 5 ||
    interestStart !== "agreement" ||
    interestStartDays !== "" ||
    !upfrontsAreDefault;

  // Plain-language statement of the timing conventions, shown with the
  // schedule (and in print) so the assumptions travel with the numbers.
  const words = periodWord(frequency, Math.round(periodDays));
  let interestNote = "";
  if (interestBeginsDay !== null) {
    let begins: string;
    if (interestStart === "first-installment") {
      begins = "starting with the first installment, so that installment is all principal";
    } else if (interestBeginsDay > 0) {
      begins = `starting ${Math.round(interestBeginsDay).toLocaleString()} days after the agreement date`;
    } else {
      begins = "from the agreement date";
    }
    interestNote = ` Interest at ${annualRate}% per year accrues on the unpaid balance ${begins}; each payment covers the interest accrued since the previous payment before it reduces principal.`;
  }
  const conventionNote = `Installments fall at the end of each ${words.each}, the first ${words.one} after the agreement date. Up-front payments fall on the day shown.${interestNote}`;

  const interestStartLabel =
    interestStart === "first-installment"
      ? "with the first installment"
      : interestStart === "days"
        ? `${interestStartDays || 0} days after agreement`
        : "from the agreement date";

  return (
    <div className="space-y-6">
      {/* Settlement + Interest row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        <ToolCard title="Settlement">
            <label
              htmlFor="payment-time-total"
              className="block text-sm font-medium text-brand-primary mb-1.5"
            >
              Total settlement amount
            </label>
            <DollarInput
              id="payment-time-total"
              value={totalSettlement}
              onChange={setTotalSettlement}
              placeholder="e.g. 250,000"
            />
          </ToolCard>

        <ToolCard title="Interest" contentClassName="space-y-4">
            <div>
              <label htmlFor="payment-over-time-interest-applies-to" className="block text-sm font-medium text-brand-primary mb-1.5">
                  Interest
                </label>
              <select
                id="payment-over-time-interest-applies-to"
                value={interestScope}
                onChange={(e) => setInterestScope(e.target.value as InterestScope)}
                className={selectClass}
              >
                <option value="none">None (0% interest)</option>
                <option value="installments">On the unpaid balance</option>
              </select>
              {interestScope !== "none" && (
                <p className="mt-1.5 text-xs text-brand-muted">
                  Interest is charged on whatever is still owed. A payment made at signing carries none, because nothing was outstanding before it was paid.
                </p>
              )}
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
                  aria-label="Annual interest rate"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="payment-over-time-interest-begins" className="block text-sm font-medium text-brand-primary mb-1.5">
                      Interest begins
                    </label>
                    <select
                      id="payment-over-time-interest-begins"
                      value={interestStart}
                      onChange={(e) => setInterestStart(e.target.value as InterestStart)}
                      className={selectClass}
                    >
                      <option value="agreement">Date of agreement (today)</option>
                      <option value="days">In a set number of days</option>
                      <option value="first-installment">With the first installment</option>
                    </select>
                  </div>
                  {interestStart === "days" && (
                    <div>
                      <label htmlFor="payment-over-time-interest-start-days" className="block text-sm font-medium text-brand-primary mb-1.5">
                        Days until interest begins
                      </label>
                      <input
                        id="payment-over-time-interest-start-days"
                        type="text"
                        inputMode="numeric"
                        value={interestStartDays}
                        onChange={(e) => setInterestStartDays(digitsOnly(e.target.value))}
                        placeholder="e.g. 30"
                        className={inputClass}
                      />
                    </div>
                  )}
                </div>
                {interestStart === "days" && (
                  <p className="text-xs text-brand-muted">
                    Useful when today&rsquo;s deal is preliminary: interest starts on the deadline for signing the formal agreement.
                  </p>
                )}
              </>
            )}
          </ToolCard>
      </div>

      {/* Up-front payments */}
      <ToolCard title="Up-Front Payments" className="print:hidden" contentClassName="space-y-4">
          {upfronts.map((u, idx) => (
            <div key={u.id} className="grid grid-cols-[1fr_1fr_auto] gap-3">
              <div>
                <label
                  htmlFor={`payment-time-upfront-amount-${u.id}`}
                  className="block text-xs font-medium text-brand-muted mb-1"
                >
                  Amount
                </label>
                <DollarInput
                  id={`payment-time-upfront-amount-${u.id}`}
                  value={u.amount}
                  onChange={(v) => updateUpfront(u.id, "amount", v)}
                  placeholder="e.g. 25,000"
                />
              </div>
              <div>
                <label htmlFor={`payment-time-upfront-days-${u.id}`} className="block text-xs font-medium text-brand-muted mb-1">
                  Days after agreement
                </label>
                <input
                  id={`payment-time-upfront-days-${u.id}`}
                  type="text"
                  inputMode="numeric"
                  value={u.days ?? ""}
                  onChange={(e) => updateUpfront(u.id, "days", digitsOnly(e.target.value))}
                  placeholder="0 = at signing"
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
        </ToolCard>

      {/* Installments */}
      <ToolCard title="Installments" className="print:hidden" contentClassName="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="payment-over-time-number-of-payments" className="block text-sm font-medium text-brand-primary mb-1.5">
                  Number of payments
                </label>
              <input
                id="payment-over-time-number-of-payments"
                type="text"
                inputMode="numeric"
                value={installmentMode === "amount" && calculatedCount > 0 ? calculatedCount.toString() : numPayments}
                onChange={(e) => {
                  setNumPayments(digitsOnly(e.target.value));
                  setInstallmentMode("count");
                }}
                placeholder="e.g. 12"
                className={`${inputClass} ${installmentMode === "amount" && calculatedCount > 0 ? "bg-brand-bg border-brand-accent/40" : ""}`}
              />
            </div>
            <div>
              <label
                htmlFor="payment-time-installment-amount"
                className="block text-sm font-medium text-brand-primary mb-1.5"
              >
                Payment amount
              </label>
              <DollarInput
                id="payment-time-installment-amount"
                value={installmentMode === "count" && calculatedPayment > 0 ? commaFmtNum(calculatedPayment) : installmentAmount}
                onChange={(v) => {
                  setInstallmentAmount(v);
                  setInstallmentMode("amount");
                }}
                placeholder="e.g. 10,000"
                className={`w-full pl-7 pr-3 py-2 text-base sm:text-sm border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent ${installmentMode === "count" && calculatedPayment > 0 ? "bg-brand-bg border-brand-accent/40" : "border-brand-border"}`}
              />
            </div>
            <div>
              <label htmlFor="payment-over-time-frequency" className="block text-sm font-medium text-brand-primary mb-1.5">
                  Frequency
                </label>
              <select
                id="payment-over-time-frequency"
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
            <div className="sm:max-w-[calc(33.333%-0.67rem)]">
              <label htmlFor="payment-over-time-interval-days" className="block text-sm font-medium text-brand-primary mb-1.5">
                  Interval (days)
                </label>
              <input
                id="payment-over-time-interval-days"
                type="text"
                inputMode="numeric"
                value={customIntervalDays}
                onChange={(e) => setCustomIntervalDays(digitsOnly(e.target.value))}
                placeholder="e.g. 60"
                className={inputClass}
              />
            </div>
          )}
          <p className="text-xs text-brand-muted">
            The first installment is due {words.one} after the agreement date.
          </p>
        </ToolCard>

      <ClearAllButton show={hasAny} onClick={clearAll} />

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

      <PrintInputs items={[
        { label: "Settlement amount", value: totalSettlement ? "$" + totalSettlement : "" },
        {
          label: "Up-front payments",
          value: upfronts
            .filter((u) => u.amount)
            .map((u) => `$${u.amount} (${parseNumNonNeg(u.days ?? "") > 0 ? `day ${u.days}` : "at signing"})`)
            .join("; "),
        },
        { label: "Number of payments", value: numPayments },
        { label: "Payment amount", value: installmentAmount ? "$" + installmentAmount : "" },
        { label: "Frequency", value: frequency === "custom" ? `every ${customIntervalDays} days` : frequency },
        { label: "Interest", value: interestScope === "none" ? "none" : `${annualRate}% on the unpaid balance, ${interestStartLabel}` },
      ]} />
      {hydrated && schedule.length === 0 && (
        <Card id="tool-headline-result" className="bg-white border-brand-accent print:hidden">
          <CardContent className="pt-6">
            <p className="text-sm text-brand-muted mb-1">Total paid</p>
            <p className="text-3xl font-bold text-brand-accent">—</p>
            <p className="text-xs text-brand-muted mt-2">Enter a settlement amount and either a number of payments or a payment amount.</p>
          </CardContent>
        </Card>
      )}

      {/* Schedule */}
      {hydrated && schedule.length > 0 && (
        <Card id="tool-headline-result" className="bg-white border-brand-border">
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
                        <th className="pb-2 pr-3 font-medium text-brand-muted text-right hidden sm:table-cell">Principal</th>
                        <th className="pb-2 pr-3 font-medium text-brand-muted text-right hidden sm:table-cell">Interest</th>
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
                          <td className="py-2 pr-3 text-right text-brand-muted tabular-nums hidden sm:table-cell">
                            {row.principal > 0 ? fmt(row.principal) : "—"}
                          </td>
                          <td className="py-2 pr-3 text-right text-brand-muted tabular-nums hidden sm:table-cell">
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

            <p className="mt-4 text-xs text-brand-muted">{conventionNote}</p>
          </CardContent>
        </Card>
      )}

      {hydrated && schedule.length > 0 && (
        <div className="print:hidden">
          <ExportPdfButton />
        </div>
      )}
      {hydrated && schedule.length > 0 && (
        <MobileResultBar label="Total paid" value={fmt(summary.totalPaid)} />
      )}
    </div>
  );
}
