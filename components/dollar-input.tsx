"use client";

import { useRef, useLayoutEffect } from "react";
import { commaFmtWithCursor } from "@/lib/format";

interface DollarInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const baseClass =
  "w-full pl-7 pr-3 py-2.5 sm:py-2 text-base sm:text-sm border border-brand-border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

export default function DollarInput({
  value,
  onChange,
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
    const formatted = commaFmtWithCursor(
      e.target.value,
      e.target.selectionStart ?? 0,
    );
    cursorRef.current = formatted.cursor;
    onChange(formatted.value);
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">
        $
      </span>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className ?? baseClass}
      />
    </div>
  );
}
