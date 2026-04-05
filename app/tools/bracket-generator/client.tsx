"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { fmt, parseNumOrNull } from "@/lib/format";

type Field = "upper" | "lower" | "mid";

export default function BracketGeneratorClient() {
  const [upperStr, setUpperStr] = useState("");
  const [lowerStr, setLowerStr] = useState("");
  const [midStr, setMidStr] = useState("");
  const [autoField, setAutoField] = useState<Field | null>(null);

  // Track which fields the user has committed at least once
  const [committed, setCommitted] = useState<Set<Field>>(new Set());

  function recalc(field: Field, uStr: string, lStr: string, mStr: string) {
    const u = parseNumOrNull(uStr);
    const l = parseNumOrNull(lStr);
    const m = parseNumOrNull(mStr);

    if (field === "upper") {
      if (u !== null && l !== null) {
        setMidStr(((u + l) / 2).toFixed(0));
        setAutoField("mid");
      } else if (u !== null && m !== null) {
        const newL = 2 * m - u;
        if (newL >= 0) {
          setLowerStr(newL.toFixed(0));
          setAutoField("lower");
        }
      }
    } else if (field === "lower") {
      if (u !== null && l !== null) {
        setMidStr(((u + l) / 2).toFixed(0));
        setAutoField("mid");
      } else if (l !== null && m !== null) {
        const newU = 2 * m - l;
        if (newU >= 0) {
          setUpperStr(newU.toFixed(0));
          setAutoField("upper");
        }
      }
    } else if (field === "mid") {
      if (u !== null && l !== null && m !== null) {
        const currentMid = (u + l) / 2;
        const delta = m - currentMid;
        const newU = u + delta;
        const newL = l + delta;
        if (newU >= 0 && newL >= 0) {
          setUpperStr(newU.toFixed(0));
          setLowerStr(newL.toFixed(0));
          setAutoField(null);
        }
      } else if (m !== null && u !== null) {
        const newL = 2 * m - u;
        if (newL >= 0) {
          setLowerStr(newL.toFixed(0));
          setAutoField("lower");
        }
      } else if (m !== null && l !== null) {
        const newU = 2 * m - l;
        if (newU >= 0) {
          setUpperStr(newU.toFixed(0));
          setAutoField("upper");
        }
      }
    }
  }

  // How many of the other two fields have been committed by the user
  function othersCommitted(field: Field): number {
    let count = 0;
    if (field !== "upper" && committed.has("upper")) count++;
    if (field !== "lower" && committed.has("lower")) count++;
    if (field !== "mid" && committed.has("mid")) count++;
    return count;
  }

  function handleChange(field: Field, value: string) {
    const newU = field === "upper" ? value : upperStr;
    const newL = field === "lower" ? value : lowerStr;
    const newM = field === "mid" ? value : midStr;

    if (field === "upper") setUpperStr(value);
    else if (field === "lower") setLowerStr(value);
    else setMidStr(value);

    // Live recalc only if 2+ fields have been previously committed by user
    if (othersCommitted(field) >= 2 || (othersCommitted(field) >= 1 && committed.has(field))) {
      if (parseNumOrNull(value) !== null) {
        recalc(field, newU, newL, newM);
      }
    }
  }

  function handleCommit(field: Field) {
    setCommitted((prev) => new Set(prev).add(field));
    recalc(field, upperStr, lowerStr, midStr);
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
    setCommitted(new Set());
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
              type="text"
              inputMode="numeric"
              value={upperStr}
              onChange={(e) => handleChange("upper", e.target.value)}
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
              type="text"
              inputMode="numeric"
              value={midStr}
              onChange={(e) => handleChange("mid", e.target.value)}
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
              type="text"
              inputMode="numeric"
              value={lowerStr}
              onChange={(e) => handleChange("lower", e.target.value)}
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
