"use client";

import ClearAllButton from "@/components/clear-all-button";
import ToolCard from "@/components/tool-card";
import PrintInputs from "@/components/print-inputs";
import { useMemo } from "react";
import { useSessionState, clearSessionKeys, dateSerializer, useHydrated } from "@/lib/use-session-state";
import { Card, CardContent } from "@/components/ui/card";
import DateInput from "@/components/date-input";
import { addMonthsClamped } from "@/lib/date-utils";
import MobileResultBar from "@/components/mobile-result-bar";

export default function DaysBetweenDatesClient() {
  const hydrated = useHydrated();
  const [startDate, setStartDate] = useSessionState<Date | null>("tool:days-between:start", null, dateSerializer);
  const [endDate, setEndDate] = useSessionState<Date | null>("tool:days-between:end", null, dateSerializer);
  const [includeEndDay, setIncludeEndDay] = useSessionState("tool:days-between:includeEndDay", false);

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

    // Years + months + days. Counting the end day inclusively is the same as
    // measuring the exclusive span to the day after the end date — computing
    // it that way keeps month-length borrowing consistent instead of bolting
    // +1 day onto an exclusive breakdown after the fact.
    const breakdownEnd = includeEndDay
      ? new Date(later.getFullYear(), later.getMonth(), later.getDate() + 1)
      : later;

    // Whole months = the most that can be added to the start (day-of-month
    // clamped, as calendars do) without passing the end; days = what's left.
    // Borrowing a month's length instead can go negative (Jan 31 → Mar 1).
    let wholeMonths =
      (breakdownEnd.getFullYear() - earlier.getFullYear()) * 12 +
      (breakdownEnd.getMonth() - earlier.getMonth());
    while (wholeMonths > 0 && addMonthsClamped(earlier, 0, wholeMonths) > breakdownEnd) wholeMonths -= 1;
    const anchor = addMonthsClamped(earlier, 0, wholeMonths);
    const dys = Math.round(
      (new Date(breakdownEnd.getFullYear(), breakdownEnd.getMonth(), breakdownEnd.getDate(), 12).getTime() -
        new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(), 12).getTime()) /
        msPerDay
    );
    const yrs = Math.floor(wholeMonths / 12);
    const mos = wholeMonths % 12;

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
    clearSessionKeys("tool:days-between:");
  }

  const hasAny = startDate !== null || endDate !== null;

  // Gate the results column until mounted so session-restored values don't
  // flash stale headline numbers on first paint.
  const displayResult = hydrated ? result : null;

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
        <ToolCard title="Dates" contentClassName="space-y-4">
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
          </ToolCard>

        <ClearAllButton show={hasAny} onClick={clearAll} />
      </div>

      <PrintInputs items={[
        { label: "Start date", value: startDate?.toLocaleDateString() },
        { label: "End date", value: endDate?.toLocaleDateString() },
        { label: "Include end day", value: includeEndDay ? "yes" : "no" },
      ]} />
      {/* Results */}
      <div className="lg:col-span-2">
        <div className="sticky top-20 space-y-6">
          <Card id="tool-headline-result" className="bg-white border-brand-accent">
            <CardContent className="pt-6">
              <p className="text-sm text-brand-muted mb-3">Duration</p>
              {displayResult ? (
                <div className="space-y-2">
                  <p className="text-xl font-bold text-brand-accent-text">
                    {formatDuration([
                      { value: displayResult.years, label: "years" },
                      { value: displayResult.months, label: "months" },
                      { value: displayResult.days, label: "days" },
                    ])}
                  </p>
                  <p className="text-xl font-bold text-brand-accent-text">
                    {formatDuration([
                      { value: displayResult.totalMonths, label: "months" },
                      { value: displayResult.monthsDays, label: "days" },
                    ])}
                  </p>
                  <p className="text-xl font-bold text-brand-accent-text">
                    {formatDuration([
                      { value: displayResult.weeks, label: "weeks" },
                      { value: displayResult.weeksDays, label: "days" },
                    ])}
                  </p>
                  <p className="text-xl font-bold text-brand-accent-text">
                    {displayResult.totalDays.toLocaleString()} days
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-brand-muted">—</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <MobileResultBar label="Total days" value={displayResult ? `${displayResult.totalDays.toLocaleString()} days` : "\u2014"} />
    </div>
  );
}
