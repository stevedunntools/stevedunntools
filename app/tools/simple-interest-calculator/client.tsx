"use client";

import { useState, useMemo } from "react";
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

type TimeUnit = "days" | "months" | "years";

const timeUnitOptions: { value: TimeUnit; label: string }[] = [
  { value: "days", label: "Days" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
];

export default function SimpleInterestClient() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState(5);
  const [timePeriod, setTimePeriod] = useState("");
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("months");

  const [committed, setCommitted] = useState({
    principal: "",
    rate: 5,
    timePeriod: "",
    timeUnit: "months" as TimeUnit,
  });

  function commit() {
    setCommitted({
      principal,
      rate,
      timePeriod,
      timeUnit,
    });
  }

  function clearAll() {
    setPrincipal("");
    setRate(5);
    setTimePeriod("");
    setTimeUnit("months");
    setCommitted({
      principal: "",
      rate: 5,
      timePeriod: "",
      timeUnit: "months",
    });
  }

  const calc = useMemo(() => {
    const p = parseNum(committed.principal);
    const r = committed.rate / 100;
    const t = parseNum(committed.timePeriod);
    const unit = committed.timeUnit;

    let timeInYears = 0;
    if (unit === "years") timeInYears = t;
    else if (unit === "months") timeInYears = t / 12;
    else if (unit === "days") timeInYears = t / 365;

    const interest = p * r * timeInYears;
    const total = p + interest;

    return {
      principal: p,
      rate: committed.rate,
      timePeriod: t,
      timeUnit: unit,
      timeInYears,
      interest,
      total,
    };
  }, [committed]);

  const hasAny = principal !== "" || timePeriod !== "";

  const plainInputClass =
    "w-full px-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

  function timeLabel(): string {
    const t = calc.timePeriod;
    const u = calc.timeUnit;
    if (t === 0) return "—";
    return `${t} ${u}`;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6">
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
                onCommit={commit}
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
              onChange={(val) => {
                setRate(val);
                setCommitted((prev) => ({ ...prev, rate: val }));
              }}
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
                  onBlur={commit}
                  onKeyDown={(e) => e.key === "Enter" && commit()}
                  placeholder="12"
                  className={plainInputClass}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-brand-primary mb-1.5">
                  Unit
                </label>
                <select
                  value={timeUnit}
                  onChange={(e) => {
                    const val = e.target.value as TimeUnit;
                    setTimeUnit(val);
                    setCommitted((prev) => ({ ...prev, timeUnit: val }));
                  }}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                >
                  {timeUnitOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
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
          <Card className="bg-white border-brand-accent">
            <CardContent className="pt-6">
              <p className="text-sm text-brand-muted mb-1">Total (Principal + Interest)</p>
              <p className="text-3xl font-bold text-brand-accent">
                {fmt(calc.total)}
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
                  <Row label="Principal" value={calc.principal} />
                  <Row label="Interest rate" value={`${calc.rate}%`} />
                  <Row label="Time period" value={timeLabel()} />
                  <Separator />
                  <Row label="Interest earned" value={calc.interest} />
                  <Separator />
                  <tr>
                    <td className="py-2 font-semibold text-brand-primary">Total</td>
                    <td className="py-2 text-right font-semibold text-brand-accent">
                      {fmt(calc.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
