"use client";

import { useState, useEffect } from "react";
import { MONTHS, daysInMonth } from "@/lib/date-utils";

interface DateInputProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
}

const selectClass =
  "px-2 py-2.5 sm:py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

const textClass =
  "w-full px-3 py-2.5 sm:py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 51 }, (_, i) => currentYear - 25 + i); // 25 years back, 25 forward

export default function DateInput({ value, onChange, label }: DateInputProps) {
  const [month, setMonth] = useState<number>(value ? value.getMonth() : -1);
  const [day, setDay] = useState<number>(value ? value.getDate() : -1);
  const [year, setYear] = useState<number>(value ? value.getFullYear() : -1);
  const [textValue, setTextValue] = useState(value ? formatDate(value) : "");

  function formatDate(d: Date): string {
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  }

  // Sync dropdowns when value changes externally
  useEffect(() => {
    if (value) {
      setMonth(value.getMonth());
      setDay(value.getDate());
      setYear(value.getFullYear());
      setTextValue(formatDate(value));
    }
  }, [value]);

  function emitDate(m: number, d: number, y: number) {
    if (m >= 0 && d > 0 && y > 0) {
      const maxDay = daysInMonth(y, m);
      const clampedDay = Math.min(d, maxDay);
      const date = new Date(y, m, clampedDay);
      onChange(date);
      setTextValue(formatDate(date));
    }
  }

  function handleMonthChange(val: number) {
    setMonth(val);
    emitDate(val, day, year);
  }

  function handleDayChange(val: number) {
    setDay(val);
    emitDate(month, val, year);
  }

  function handleYearChange(val: number) {
    setYear(val);
    emitDate(month, day, val);
  }

  function handleTextCommit() {
    const parsed = parseTextDate(textValue);
    if (parsed) {
      setMonth(parsed.getMonth());
      setDay(parsed.getDate());
      setYear(parsed.getFullYear());
      onChange(parsed);
    } else if (textValue.trim() === "") {
      setMonth(-1);
      setDay(-1);
      setYear(-1);
      onChange(null);
    }
  }

  function parseTextDate(s: string): Date | null {
    const trimmed = s.trim();
    if (!trimmed) return null;

    // Try M/D/YYYY or M-D-YYYY
    const match = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
    if (match) {
      let m = parseInt(match[1]) - 1;
      let d = parseInt(match[2]);
      let y = parseInt(match[3]);
      if (y < 100) y += 2000;
      if (m >= 0 && m <= 11 && d >= 1 && d <= 31 && y >= 1900) {
        const maxDay = daysInMonth(y, m);
        d = Math.min(d, maxDay);
        return new Date(y, m, d);
      }
    }
    return null;
  }

  const maxDays = month >= 0 && year > 0 ? daysInMonth(year, month) : 31;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-brand-primary mb-1.5">
          {label}
        </label>
      )}
      {/* Text input */}
      <input
        type="text"
        value={textValue}
        onChange={(e) => setTextValue(e.target.value)}
        onBlur={handleTextCommit}
        onKeyDown={(e) => e.key === "Enter" && handleTextCommit()}
        placeholder="MM/DD/YYYY"
        className={`${textClass} mb-2`}
      />
      {/* Dropdowns */}
      <div className="flex gap-2">
        <select
          value={month}
          onChange={(e) => handleMonthChange(parseInt(e.target.value))}
          className={`${selectClass} flex-[3]`}
        >
          <option value={-1}>Month</option>
          {MONTHS.map((name, i) => (
            <option key={i} value={i}>{name}</option>
          ))}
        </select>
        <select
          value={day}
          onChange={(e) => handleDayChange(parseInt(e.target.value))}
          className={`${selectClass} flex-[2]`}
        >
          <option value={-1}>Day</option>
          {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
          className={`${selectClass} flex-[2]`}
        >
          <option value={-1}>Year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
