"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import DateInput from "@/components/date-input";
import { addBusinessDays, countBusinessDays, MONTHS } from "@/lib/date-utils";

type Direction = "add" | "subtract";
type HolidayMode = "federal" | "weekends-only";

const inputClass =
  "w-full px-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

const selectClass =
  "w-full px-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

export default function AddSubtractDateClient() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState<Direction>("add");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [weeks, setWeeks] = useState("");
  const [days, setDays] = useState("");
  const [businessDays, setBusinessDays] = useState(false);
  const [holidayMode, setHolidayMode] = useState<HolidayMode>("federal");

  const result = useMemo(() => {
    if (!startDate) return null;

    const yrs = parseInt(years) || 0;
    const mos = parseInt(months) || 0;
    const wks = parseInt(weeks) || 0;
    const dys = parseInt(days) || 0;

    if (yrs === 0 && mos === 0 && wks === 0 && dys === 0) return null;

    const sign = direction === "add" ? 1 : -1;

    // Start by adding/subtracting years and months (calendar-based)
    let resultDate = new Date(startDate);
    resultDate.setFullYear(resultDate.getFullYear() + sign * yrs);
    resultDate.setMonth(resultDate.getMonth() + sign * mos);

    // Add/subtract weeks as calendar days
    resultDate.setDate(resultDate.getDate() + sign * wks * 7);

    // Add/subtract days
    if (businessDays && dys > 0) {
      const excludeHolidays = holidayMode === "federal";
      resultDate = addBusinessDays(resultDate, sign * dys, excludeHolidays);
    } else {
      resultDate.setDate(resultDate.getDate() + sign * dys);
    }

    // Count calendar days between start and result
    const msPerDay = 1000 * 60 * 60 * 24;
    const totalCalendarDays = Math.abs(
      Math.round((resultDate.getTime() - startDate.getTime()) / msPerDay)
    );

    // Count business days between start and result
    const excludeHolidays = holidayMode === "federal";
    const totalBizDays = countBusinessDays(
      startDate <= resultDate ? startDate : resultDate,
      startDate <= resultDate ? resultDate : startDate,
      excludeHolidays
    );

    return {
      date: resultDate,
      totalCalendarDays,
      totalBusinessDays: totalBizDays,
    };
  }, [startDate, direction, years, months, weeks, days, businessDays, holidayMode]);

  function formatDate(d: Date): string {
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function dayOfWeek(d: Date): string {
    return d.toLocaleDateString("en-US", { weekday: "long" });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6">
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Start Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DateInput value={startDate} onChange={setStartDate} />
          </CardContent>
        </Card>

        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Operation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setDirection("add")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                  direction === "add"
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-brand-muted border-brand-border hover:border-brand-accent"
                }`}
              >
                Add
              </button>
              <button
                onClick={() => setDirection("subtract")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                  direction === "subtract"
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-brand-muted border-brand-border hover:border-brand-accent"
                }`}
              >
                Subtract
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Years
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Months
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Weeks
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={weeks}
                  onChange={(e) => setWeeks(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Days
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Business Days
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={businessDays}
                onChange={(e) => setBusinessDays(e.target.checked)}
                className="h-4 w-4 rounded border-brand-border text-brand-accent focus:ring-brand-accent"
              />
              <span className="text-sm text-brand-primary">
                Calculate days in business days
              </span>
            </label>
            <p className="text-xs text-brand-muted">
              When enabled, the &ldquo;days&rdquo; field counts only business
              days. Years, months, and weeks are always calendar-based.
            </p>
            {businessDays && (
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Exclude
                </label>
                <select
                  value={holidayMode}
                  onChange={(e) => setHolidayMode(e.target.value as HolidayMode)}
                  className={selectClass}
                >
                  <option value="federal">Weekends + federal holidays</option>
                  <option value="weekends-only">Weekends only</option>
                </select>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="lg:col-span-2">
        <div className="sticky top-20 space-y-6">
          <Card className="bg-white border-brand-accent">
            <CardContent className="pt-6">
              <p className="text-sm text-brand-muted mb-1">Resulting Date</p>
              {result ? (
                <>
                  <p className="text-2xl font-bold text-brand-accent">
                    {formatDate(result.date)}
                  </p>
                  <p className="text-sm text-brand-muted mt-1">
                    {dayOfWeek(result.date)}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-brand-muted">—</p>
              )}
            </CardContent>
          </Card>

          {result && (
            <Card className="bg-white border-brand-border">
              <CardHeader>
                <CardTitle className="text-brand-primary text-base">
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-brand-border/50">
                      <td className="py-2 text-brand-muted">Calendar days</td>
                      <td className="py-2 text-right font-medium text-brand-primary">
                        {result.totalCalendarDays.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-brand-muted">Business days</td>
                      <td className="py-2 text-right font-medium text-brand-primary">
                        {result.totalBusinessDays.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
