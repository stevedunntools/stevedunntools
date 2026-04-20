"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { useSessionState, clearSessionKeys } from "@/lib/use-session-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { fmt, commaFmt, parseNumOrNull } from "@/lib/format";

type Field = "upper" | "lower" | "mid";

export default function BracketGeneratorClient() {
  const [upperStr, setUpperStr] = useSessionState("tool:bracket:upper", "");
  const [lowerStr, setLowerStr] = useSessionState("tool:bracket:lower", "");
  const [midStr, setMidStr] = useSessionState("tool:bracket:mid", "");
  const [autoField, setAutoField] = useState<Field | null>(null);
  const upperRef = useRef<HTMLInputElement>(null);
  const midRef = useRef<HTMLInputElement>(null);
  const lowerRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<{ ref: React.RefObject<HTMLInputElement | null>; pos: number } | null>(null);

  useLayoutEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.ref.current?.setSelectionRange(cursorRef.current.pos, cursorRef.current.pos);
      cursorRef.current = null;
    }
  });

  function recalc(field: Field) {
    const u = parseNumOrNull(upperStr);
    const l = parseNumOrNull(lowerStr);
    const m = parseNumOrNull(midStr);

    if (field === "upper") {
      if (u !== null && l !== null) {
        setMidStr(commaFmt(((u + l) / 2).toFixed(0)));
        setAutoField("mid");
      } else if (u !== null && m !== null) {
        setLowerStr(commaFmt((2 * m - u).toFixed(0)));
        setAutoField("lower");
      }
    } else if (field === "lower") {
      if (u !== null && l !== null) {
        setMidStr(commaFmt(((u + l) / 2).toFixed(0)));
        setAutoField("mid");
      } else if (l !== null && m !== null) {
        setUpperStr(commaFmt((2 * m - l).toFixed(0)));
        setAutoField("upper");
      }
    } else if (field === "mid") {
      if (u !== null && l !== null && m !== null) {
        const currentMid = (u + l) / 2;
        const delta = m - currentMid;
        setUpperStr(commaFmt((u + delta).toFixed(0)));
        setLowerStr(commaFmt((l + delta).toFixed(0)));
        setAutoField(null);
      } else if (m !== null && u !== null) {
        setLowerStr(commaFmt((2 * m - u).toFixed(0)));
        setAutoField("lower");
      } else if (m !== null && l !== null) {
        setUpperStr(commaFmt((2 * m - l).toFixed(0)));
        setAutoField("upper");
      }
    }
  }

  function handleChange(field: Field, e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const cursor = e.target.selectionStart ?? 0;
    const digitsBefore = raw.slice(0, cursor).replace(/[^0-9]/g, "").length;
    const formatted = commaFmt(raw);

    let newCursor = 0;
    let digits = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/[0-9]/.test(formatted[i])) digits++;
      if (digits === digitsBefore) { newCursor = i + 1; break; }
    }
    if (digitsBefore === 0) newCursor = 0;

    const ref = field === "upper" ? upperRef : field === "mid" ? midRef : lowerRef;
    cursorRef.current = { ref, pos: newCursor };

    if (field === "upper") setUpperStr(formatted);
    else if (field === "lower") setLowerStr(formatted);
    else setMidStr(formatted);
  }

  function handleCommit(field: Field) {
    recalc(field);
  }

  function handleKeyDown(field: Field, e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleCommit(field);
    }
  }

  const upper = parseNumOrNull(upperStr);
  const lower = parseNumOrNull(lowerStr);
  const mid = parseNumOrNull(midStr);
  const allFilled = upper !== null && lower !== null && mid !== null;
  const hasAny = upperStr !== "" || lowerStr !== "" || midStr !== "";
  const invalidRange = upper !== null && lower !== null && lower > upper;

  function clearAll() {
    setUpperStr("");
    setLowerStr("");
    setMidStr("");
    setAutoField(null);
    clearSessionKeys("tool:bracket:");
  }

  return (
    <Card className="bg-white border-brand-border max-w-md">
      <CardContent className="pt-6 space-y-5">
        {/* Upper */}
        <div>
          <label className="block text-sm font-medium text-brand-primary mb-1.5">
            Upper
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
            <input
              ref={upperRef}
              type="text"
              inputMode="numeric"
              value={upperStr}
              onChange={(e) => handleChange("upper", e)}
              onBlur={() => handleCommit("upper")}
              onKeyDown={(e) => handleKeyDown("upper", e)}
              placeholder="500,000"
              className={`w-full pl-7 pr-3 py-2 text-sm border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent ${
                autoField === "upper" ? "border-brand-accent/40 bg-brand-bg" : "border-brand-border"
              }`}
            />
          </div>
        </div>

        {/* Midpoint */}
        <div>
          <label className="block text-sm font-medium text-brand-primary mb-1.5">
            Midpoint
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
            <input
              ref={midRef}
              type="text"
              inputMode="numeric"
              value={midStr}
              onChange={(e) => handleChange("mid", e)}
              onBlur={() => handleCommit("mid")}
              onKeyDown={(e) => handleKeyDown("mid", e)}
              placeholder="350,000"
              className={`w-full pl-7 pr-3 py-2 text-sm border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent ${
                autoField === "mid" ? "border-brand-accent/40 bg-brand-bg" : "border-brand-border"
              }`}
            />
          </div>
        </div>

        {/* Lower */}
        <div>
          <label className="block text-sm font-medium text-brand-primary mb-1.5">
            Lower
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
            <input
              ref={lowerRef}
              type="text"
              inputMode="numeric"
              value={lowerStr}
              onChange={(e) => handleChange("lower", e)}
              onBlur={() => handleCommit("lower")}
              onKeyDown={(e) => handleKeyDown("lower", e)}
              placeholder="200,000"
              className={`w-full pl-7 pr-3 py-2 text-sm border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent ${
                autoField === "lower" ? "border-brand-accent/40 bg-brand-bg" : "border-brand-border"
              }`}
            />
          </div>
        </div>

        {/* Summary */}
        {invalidRange && (
          <div className="pt-2 border-t border-brand-border text-sm text-brand-caution">
            <p>Lower value should be less than upper value</p>
          </div>
        )}
        {allFilled && !invalidRange && (
          <div className="pt-2 border-t border-brand-border text-sm text-brand-muted space-y-1">
            <p>
              Bracket: <span className="font-medium text-brand-primary">{fmt(lower)}</span> &ndash; <span className="font-medium text-brand-primary">{fmt(upper)}</span>
            </p>
            <p>
              Midpoint: <span className="font-medium text-brand-primary">{fmt(mid)}</span>
            </p>
          </div>
        )}

        {hasAny && (
          <Button variant="outline" onClick={clearAll} className="w-full">
            Clear All
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
