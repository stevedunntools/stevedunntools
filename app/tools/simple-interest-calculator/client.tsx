"use client";

import ClearAllButton from "@/components/clear-all-button";
import ToolCard from "@/components/tool-card";
import { calculateSimpleInterest } from "./calculate";
import PrintInputs from "@/components/print-inputs";
import { useSessionState, clearSessionKeys, useHydrated } from "@/lib/use-session-state";
import { fmt, parseNumNonNeg } from "@/lib/format";
import { Row, Separator, TotalRow } from "@/components/breakdown-table";
import DollarInput from "@/components/dollar-input";
import PercentSlider from "@/components/percent-slider";
import ResultsShell from "@/components/results-shell";
import { textFieldClass, selectFieldClass } from "@/lib/field-styles";
import MobileResultBar from "@/components/mobile-result-bar";

type TimeUnit = "days" | "months" | "years";

const timeUnitOptions: { value: TimeUnit; label: string }[] = [
  { value: "days", label: "Days" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
];

export default function SimpleInterestClient() {
  const hydrated = useHydrated();
  const [principal, setPrincipal] = useSessionState("tool:simple-interest:principal", "");
  const [rate, setRate] = useSessionState("tool:simple-interest:rate", 5);
  const [timePeriod, setTimePeriod] = useSessionState("tool:simple-interest:timePeriod", "");
  const [timeUnit, setTimeUnit] = useSessionState<TimeUnit>("tool:simple-interest:timeUnit", "months");

  function clearAll() {
    setPrincipal("");
    setRate(5);
    setTimePeriod("");
    setTimeUnit("months");
    clearSessionKeys("tool:simple-interest:");
  }

  const p = parseNumNonNeg(principal);
  const t = parseNumNonNeg(timePeriod);

  const { interest, total } = calculateSimpleInterest(p, rate, t, timeUnit);

  const hasAny = principal !== "" || timePeriod !== "";
  const timeLabel = !hydrated || t === 0 ? "—" : `${t} ${timeUnit}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6 print:hidden">
        <ToolCard title="Principal">
            <div className="max-w-[calc(50%-0.5rem)]">
              <label
                htmlFor="simple-interest-principal"
                className="block text-sm font-medium text-brand-primary mb-1.5"
              >
                Principal amount
              </label>
              <DollarInput
                id="simple-interest-principal"
                value={principal}
                onChange={setPrincipal}
                placeholder="e.g. 100,000"
              />
            </div>
          </ToolCard>

        <ToolCard title="Interest Rate">
            <PercentSlider
              value={rate}
              onChange={setRate}
              min={0}
              max={20}
              allowOverflow
              label="Annual interest rate (type a value for rates above 20%)"
              aria-label="Annual interest rate"
            />
          </ToolCard>

        <ToolCard title="Time Period">
            <div className="grid grid-cols-2 gap-3 max-w-[calc(66%)]">
              <div className="flex-1">
                <label htmlFor="simple-interest-duration" className="block text-sm font-medium text-brand-primary mb-1.5">
                  Duration
                </label>
                <input
                  id="simple-interest-duration"
                  type="text"
                  inputMode="numeric"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  placeholder="e.g. 12"
                  className={textFieldClass}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="simple-interest-unit" className="block text-sm font-medium text-brand-primary mb-1.5">
                  Unit
                </label>
                <select
                  id="simple-interest-unit"
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
                  className={selectFieldClass}
                >
                  {timeUnitOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-2 text-xs text-brand-muted">Uses a 365-day year</p>
          </ToolCard>

        <ClearAllButton show={hasAny} onClick={clearAll} />
      </div>

      <PrintInputs items={[
        { label: "Principal", value: principal ? "$" + principal : "" },
        { label: "Annual rate", value: `${rate}%` },
        { label: "Time", value: timePeriod ? `${timePeriod} ${timeUnit}` : "" },
      ]} />
      {/* Results */}
      <div className="lg:col-span-2">
        <ResultsShell
          label="Total (Principal + Interest)"
          value={hydrated && hasAny ? fmt(total) : "—"}
        >
          <ToolCard title="Breakdown">
              <table className="w-full text-sm">
                <tbody>
                  <Row label="Principal" value={hydrated && hasAny ? p : "—"} />
                  <Row label="Interest rate" value={hydrated && hasAny ? `${rate}%` : "—"} />
                  <Row label="Time period" value={timeLabel} />
                  <Separator />
                  <Row label="Interest earned" value={hydrated && hasAny ? interest : "—"} />
                  <Separator />
                  <TotalRow label="Total" value={hydrated && hasAny ? fmt(total) : "—"} />
                </tbody>
              </table>
            </ToolCard>
        </ResultsShell>
      </div>
      <MobileResultBar label="Total" value={hydrated && hasAny ? fmt(total) : "—"} />
    </div>
  );
}
