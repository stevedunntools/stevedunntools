"use client";

import { useState, useEffect } from "react";

interface PercentSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  /** Allow typing values above the slider max */
  allowOverflow?: boolean;
}

export default function PercentSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  allowOverflow = false,
}: PercentSliderProps) {
  const [textValue, setTextValue] = useState(formatPct(value));

  useEffect(() => { setTextValue(formatPct(value)); }, [value]);

  function formatPct(n: number) {
    return Number.isInteger(n) ? n.toString() : n.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  }

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    onChange(val);
    setTextValue(formatPct(val));
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTextValue(e.target.value);
  }

  function handleTextCommit() {
    const parsed = parseFloat(textValue);
    if (isNaN(parsed) || parsed < min) {
      setTextValue(formatPct(value));
      return;
    }
    if (!allowOverflow && parsed > max) {
      setTextValue(formatPct(value));
      return;
    }
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
            className="w-16 text-center text-lg font-semibold text-brand-accent bg-transparent border-b border-brand-border focus:border-brand-accent focus:outline-none"
          />
          <span className="text-lg font-semibold text-brand-accent">%</span>
        </div>
        <span className="text-sm text-brand-muted">{max}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onChange={handleSlider}
        className="w-full accent-brand-accent"
      />
      {label && <p className="text-xs text-brand-muted">{label}</p>}
    </div>
  );
}
