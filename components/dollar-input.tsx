"use client";

import { useRef, useLayoutEffect } from "react";
import { commaFmt } from "@/lib/format";

interface DollarInputProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  placeholder?: string;
  className?: string;
}

const baseClass =
  "w-full pl-7 pr-3 py-2.5 sm:py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

export default function DollarInput({
  value,
  onChange,
  onCommit,
  placeholder,
  className,
}: DollarInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (cursorRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorRef.current, cursorRef.current);
      cursorRef.current = null;
    }
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const cursor = e.target.selectionStart ?? 0;

    // Count digits before cursor in the raw input
    const digitsBefore = raw.slice(0, cursor).replace(/[^0-9]/g, "").length;

    const formatted = commaFmt(raw);

    // Find the cursor position in the formatted string that has the same
    // number of digits before it
    let digits = 0;
    let newCursor = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/[0-9]/.test(formatted[i])) digits++;
      if (digits === digitsBefore) {
        newCursor = i + 1;
        break;
      }
    }
    if (digitsBefore === 0) newCursor = 0;

    cursorRef.current = newCursor;
    onChange(formatted);
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">
        $
      </span>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        onBlur={onCommit}
        onKeyDown={(e) => e.key === "Enter" && onCommit()}
        placeholder={placeholder}
        className={className ?? baseClass}
      />
    </div>
  );
}
