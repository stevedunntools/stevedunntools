"use client";

import { useState } from "react";

interface PercentSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  /** Accessible name applied to both the range slider and the text box. */
  "aria-label"?: string;
  /** Allow typing values above the slider max */
  allowOverflow?: boolean;
}

function formatPct(n: number) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export default function PercentSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  "aria-label": ariaLabel,
  allowOverflow = false,
}: PercentSliderProps) {
  const [textValue, setTextValue] = useState(formatPct(value));
  const [error, setError] = useState<string | null>(null);

  // Sync the text box when the value prop changes externally (slider drag,
  // Clear All). Render-phase adjustment instead of an effect.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setTextValue(formatPct(value));
    setError(null);
  }

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    onChange(val);
    setTextValue(formatPct(val));
    setError(null);
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTextValue(e.target.value);
    setError(null);
  }

  function handleTextCommit() {
    const parsed = parseFloat(textValue);
    if (isNaN(parsed) || parsed < min || (!allowOverflow && parsed > max)) {
      setError(
        allowOverflow
          ? `Enter a number ${min} or greater`
          : `Enter a number between ${min} and ${max}`
      );
      setTextValue(formatPct(value));
      return;
    }
    setError(null);
    onChange(parsed);
    setTextValue(formatPct(parsed));
  }

  // Slider clamps to its range even if the actual value is higher
  const sliderValue = Math.min(value, max);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-brand-muted">{min}%</span>
        <div className="flex items-baseline gap-1">
          <input
            type="text"
            value={textValue}
            onChange={handleTextChange}
            onBlur={handleTextCommit}
            onKeyDown={(e) => e.key === "Enter" && handleTextCommit()}
            aria-label={ariaLabel}
            aria-invalid={error ? true : undefined}
            className={`w-16 text-center text-lg font-semibold text-brand-accent-text bg-transparent border-b focus:outline-none ${
              error
                ? "border-brand-error"
                : "border-brand-border focus:border-brand-accent"
            }`}
          />
          <span className="text-lg font-semibold text-brand-accent-text">%</span>
        </div>
        <span className="text-sm text-brand-muted">{max}%</span>
      </div>
      {error && (
        <p role="alert" className="text-xs text-brand-error">
          {error}
        </p>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onChange={handleSlider}
        aria-label={ariaLabel}
        className="w-full accent-brand-accent"
      />
      {label && <p className="text-xs text-brand-muted">{label}</p>}
    </div>
  );
}
