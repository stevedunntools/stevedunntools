"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import DateInput from "@/components/date-input";

export default function DaysBetweenDatesClient() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [includeEndDay, setIncludeEndDay] = useState(false);

  const result = useMemo(() => {
    if (!startDate || !endDate) return null;

    // Ensure start <= end
    const [earlier, later] =
      startDate <= endDate ? [startDate, endDate] : [endDate, startDate];

    // Normalize to noon to avoid DST edge cases
    const earlierNoon = new Date(earlier.getFullYear(), earlier.getMonth(), earlier.getDate(), 12);
    const laterNoon = new Date(later.getFullYear(), later.getMonth(), later.getDate(), 12);

    // Total days
    const msPerDay = 1000 * 60 * 60 * 24;
    let totalDays = Math.round(
      (laterNoon.getTime() - earlierNoon.getTime()) / msPerDay
    );
    if (includeEndDay) totalDays += 1;

    // Years + months + days
    let yrs = later.getFullYear() - earlier.getFullYear();
    let mos = later.getMonth() - earlier.getMonth();
    let dys = later.getDate() - earlier.getDate();

    if (dys < 0) {
      mos -= 1;
      // Days in the previous month of the later date
      const prevMonth = new Date(later.getFullYear(), later.getMonth(), 0);
      dys += prevMonth.getDate();
    }
    if (mos < 0) {
      yrs -= 1;
      mos += 12;
    }
    if (includeEndDay) {
      dys += 1;
      // Overflow days into months
      const maxDays = new Date(
        later.getFullYear(),
        later.getMonth() + 1,
        0
      ).getDate();
      if (dys >= maxDays) {
        dys -= maxDays;
        mos += 1;
      }
      if (mos >= 12) {
        mos -= 12;
        yrs += 1;
      }
    }

    // Total months + remaining days
    const totalMonths = yrs * 12 + mos;

    // Weeks + remaining days
    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;

    return {
      totalDays,
      years: yrs,
      months: mos,
      days: dys,
      totalMonths,
      monthsDays: dys,
      weeks,
      weeksDays: remainingDays,
    };
  }, [startDate, endDate, includeEndDay]);

  function clearAll() {
    setStartDate(null);
    setEndDate(null);
    setIncludeEndDay(false);
  }

  const hasAny = startDate !== null || endDate !== null;

  function formatDuration(parts: { value: number; label: string }[]): string {
    const nonZero = parts.filter((p) => p.value > 0);
    if (nonZero.length === 0) return "0 days";
    return nonZero
      .map((p) => `${p.value} ${p.value === 1 ? p.label.replace(/s$/, "") : p.label}`)
      .join(", ");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6">
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DateInput
                label="Start date"
                value={startDate}
                onChange={setStartDate}
              />
              <DateInput
                label="End date"
                value={endDate}
                onChange={setEndDate}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeEndDay}
                onChange={(e) => setIncludeEndDay(e.target.checked)}
                className="h-5 w-5 sm:h-4 sm:w-4 rounded border-brand-border text-brand-accent focus:ring-brand-accent"
              />
              <span className="text-sm text-brand-muted">
                Include end day (add 1 day)
              </span>
            </label>
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
              <p className="text-sm text-brand-muted mb-3">Duration</p>
              {result ? (
                <div className="space-y-2">
                  <p className="text-xl font-bold text-brand-accent">
                    {formatDuration([
                      { value: result.years, label: "years" },
                      { value: result.months, label: "months" },
                      { value: result.days, label: "days" },
                    ])}
                  </p>
                  <p className="text-xl font-bold text-brand-accent">
                    {formatDuration([
                      { value: result.totalMonths, label: "months" },
                      { value: result.monthsDays, label: "days" },
                    ])}
                  </p>
                  <p className="text-xl font-bold text-brand-accent">
                    {formatDuration([
                      { value: result.weeks, label: "weeks" },
                      { value: result.weeksDays, label: "days" },
                    ])}
                  </p>
                  <p className="text-xl font-bold text-brand-accent">
                    {result.totalDays.toLocaleString()} days
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-brand-muted">—</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
