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

  let timeInYears = 0;
  if (timeUnit === "years") timeInYears = t;
  else if (timeUnit === "months") timeInYears = t / 12;
  else timeInYears = t / 365;

  const interest = p * (rate / 100) * timeInYears;
  const total = p + interest;

  const hasAny = principal !== "" || timePeriod !== "";
  const timeLabel = !hydrated || t === 0 ? "—" : `${t} ${timeUnit}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6 print:hidden">
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Interest Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PercentSlider
              value={rate}
              onChange={setRate}
              min={0}
              max={20}
              allowOverflow
              label="Annual interest rate (type a value for rates above 20%)"
              aria-label="Annual interest rate"
            />
          </CardContent>
        </Card>

        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Time Period
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {hasAny && (
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
        )}
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
          <Card className="bg-white border-brand-border">
            <CardHeader>
              <CardTitle className="text-brand-primary text-base">Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </ResultsShell>
      </div>
      <MobileResultBar label="Total" value={hydrated && hasAny ? fmt(total) : "—"} />
    </div>
  );
}
