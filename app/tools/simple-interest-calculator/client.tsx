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
import PercentSlider from "@/components/percent-slider";
import EstimateDisclaimer from "@/components/estimate-disclaimer";
import ExportPdfButton from "@/components/export-pdf-button";
import { textFieldClass, selectFieldClass } from "@/lib/field-styles";

type TimeUnit = "days" | "months" | "years";

const timeUnitOptions: { value: TimeUnit; label: string }[] = [
  { value: "days", label: "Days" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
];

export default function SimpleInterestClient() {
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

  const p = parseNum(principal);
  const t = parseNum(timePeriod);

  let timeInYears = 0;
  if (timeUnit === "years") timeInYears = t;
  else if (timeUnit === "months") timeInYears = t / 12;
  else timeInYears = t / 365;

  const interest = p * (rate / 100) * timeInYears;
  const total = p + interest;

  const hasAny = principal !== "" || timePeriod !== "";
  const timeLabel = t === 0 ? "—" : `${t} ${timeUnit}`;

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
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Principal amount
              </label>
              <DollarInput
                value={principal}
                onChange={setPrincipal}
                placeholder="100,000"
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
              min={1}
              max={20}
              allowOverflow
              label="Annual interest rate (type a value for rates above 20%)"
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
                <label className="block text-sm font-medium text-brand-primary mb-1.5">
                  Duration
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  placeholder="12"
                  className={textFieldClass}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-brand-primary mb-1.5">
                  Unit
                </label>
                <select
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

      {/* Results */}
      <div className="lg:col-span-2">
        <div className="sticky top-20 space-y-6">
          <Card className="bg-white border-brand-accent">
            <CardContent className="pt-6">
              <p className="text-sm text-brand-muted mb-1">Total (Principal + Interest)</p>
              <p className="text-3xl font-bold text-brand-accent">
                {fmt(total)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-brand-border">
            <CardHeader>
              <CardTitle className="text-brand-primary text-base">Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <tbody>
                  <Row label="Principal" value={p} />
                  <Row label="Interest rate" value={`${rate}%`} />
                  <Row label="Time period" value={timeLabel} />
                  <Separator />
                  <Row label="Interest earned" value={interest} />
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
