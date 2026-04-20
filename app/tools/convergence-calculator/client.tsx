"use client";

import { useState, useMemo, useRef, useLayoutEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fmt, commaFmt, parseNumOrNull } from "@/lib/format";
import { generateYTicks, formatTickLabel } from "@/lib/chart-utils";

// ---------------------------------------------------------------------------
// Chart constants
// ---------------------------------------------------------------------------

const CHART_W = 800;
const CHART_H = 420;
const PAD = { top: 20, right: 30, bottom: 50, left: 80 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

const BLUE = "#4A90D9";
const RED = "#DC2626";
const GREEN = "#16A34A";

// ---------------------------------------------------------------------------
// Chart
// ---------------------------------------------------------------------------

interface ChartData {
  p1: number;
  p2: number;
  d1: number;
  d2: number;
  intersectRound: number;
  intersectValue: number;
}

function TrendChart({ data }: { data: ChartData }) {
  const { p1, p2, d1, d2, intersectRound, intersectValue } = data;

  // Determine how many rounds to show: at least 1 past the intersection, minimum 4
  const maxRound = Math.max(Math.ceil(intersectRound) + 1, 4);

  // Y-axis range
  const allVals = [p1, p2, d1, d2, intersectValue];
  const pAtMax = p1 + (p2 - p1) * (maxRound - 1);
  const dAtMax = d1 + (d2 - d1) * (maxRound - 1);
  allVals.push(pAtMax, dAtMax);

  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  const range = rawMax - rawMin;
  const padding = Math.max(range * 0.15, rawMax * 0.1, 1);
  const yMin = Math.max(0, rawMin - padding);
  const yMax = rawMax + padding;

  function xScale(r: number) {
    return PAD.left + ((r - 1) / (maxRound - 1)) * INNER_W;
  }

  function yScale(v: number) {
    return PAD.top + INNER_H - ((v - yMin) / (yMax - yMin)) * INNER_H;
  }

  // Y ticks
  const yTicks = useMemo(() => generateYTicks(yMin, yMax), [yMin, yMax]);

  // Points
  const pSolid = [
    { x: xScale(1), y: yScale(p1) },
    { x: xScale(2), y: yScale(p2) },
  ];
  const dSolid = [
    { x: xScale(1), y: yScale(d1) },
    { x: xScale(2), y: yScale(d2) },
  ];

  const intX = xScale(intersectRound);
  const intY = yScale(intersectValue);

  const pDotted = [
    { x: xScale(2), y: yScale(p2) },
    { x: intX, y: intY },
  ];
  const dDotted = [
    { x: xScale(2), y: yScale(d2) },
    { x: intX, y: intY },
  ];

  function pathD(pts: { x: number; y: number }[]) {
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  }

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Trend analysis chart showing projected intersection of offers"
    >
      {/* Grid lines and Y-axis labels */}
      {yTicks.map((v) => (
        <g key={`ytick-${v}`}>
          <line
            x1={PAD.left}
            y1={yScale(v)}
            x2={PAD.left + INNER_W}
            y2={yScale(v)}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
          <text
            x={PAD.left - 10}
            y={yScale(v)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-brand-muted"
            fontSize="11"
          >
            {formatTickLabel(v)}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {Array.from({ length: maxRound }, (_, i) => i + 1).map((r) => (
        <text
          key={`xtick-${r}`}
          x={xScale(r)}
          y={CHART_H - PAD.bottom + 25}
          textAnchor="middle"
          className="fill-brand-muted"
          fontSize="12"
        >
          {r}
        </text>
      ))}

      {/* X-axis title */}
      <text
        x={PAD.left + INNER_W / 2}
        y={CHART_H - 5}
        textAnchor="middle"
        className="fill-brand-muted"
        fontSize="12"
      >
        Round
      </text>

      {/* Axis lines */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + INNER_H} stroke="#D1D5DB" strokeWidth="1" />
      <line x1={PAD.left} y1={PAD.top + INNER_H} x2={PAD.left + INNER_W} y2={PAD.top + INNER_H} stroke="#D1D5DB" strokeWidth="1" />

      {/* Plaintiff solid line (rounds 1-2) */}
      <path d={pathD(pSolid)} fill="none" stroke={BLUE} strokeWidth="2" />

      {/* Defendant solid line (rounds 1-2) */}
      <path d={pathD(dSolid)} fill="none" stroke={RED} strokeWidth="2" />

      {/* Plaintiff extrapolation (dotted) */}
      <path d={pathD(pDotted)} fill="none" stroke={BLUE} strokeWidth="1.5" strokeDasharray="5 3" />

      {/* Defendant extrapolation (dotted) */}
      <path d={pathD(dDotted)} fill="none" stroke={RED} strokeWidth="1.5" strokeDasharray="5 3" />

      {/* Plaintiff dots */}
      {pSolid.map((p, i) => (
        <circle key={`p-${i}`} cx={p.x} cy={p.y} r="4.5" fill={BLUE} stroke="white" strokeWidth="1.5" />
      ))}

      {/* Defendant dots */}
      {dSolid.map((p, i) => (
        <circle key={`d-${i}`} cx={p.x} cy={p.y} r="4.5" fill={RED} stroke="white" strokeWidth="1.5" />
      ))}

      {/* Intersection point */}
      <circle cx={intX} cy={intY} r="6" fill={GREEN} stroke="white" strokeWidth="2" />

      {/* Intersection label */}
      <text
        x={intX}
        y={intY - 14}
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill={GREEN}
      >
        {fmt(Math.round(intersectValue))}
      </text>
      <text
        x={intX}
        y={intY - 26}
        textAnchor="middle"
        fontSize="10"
        className="fill-brand-muted"
      >
        Round {intersectRound % 1 === 0 ? intersectRound : intersectRound.toFixed(1)}
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ConvergenceCalculatorClient() {
  const [p1Str, setP1Str] = useState("");
  const [p2Str, setP2Str] = useState("");
  const [d1Str, setD1Str] = useState("");
  const [d2Str, setD2Str] = useState("");
  const p1Ref = useRef<HTMLInputElement>(null);
  const p2Ref = useRef<HTMLInputElement>(null);
  const d1Ref = useRef<HTMLInputElement>(null);
  const d2Ref = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<{ ref: React.RefObject<HTMLInputElement | null>; pos: number } | null>(null);

  useLayoutEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.ref.current?.setSelectionRange(cursorRef.current.pos, cursorRef.current.pos);
      cursorRef.current = null;
    }
  });

  function handleInput(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void,
    ref: React.RefObject<HTMLInputElement | null>,
  ) {
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

    cursorRef.current = { ref, pos: newCursor };
    setter(formatted);
  }

  // Committed values — only these feed the chart
  const [committed, setCommitted] = useState({ p1: "", p2: "", d1: "", d2: "" });

  function commit() {
    setCommitted({ p1: p1Str, p2: p2Str, d1: d1Str, d2: d2Str });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commit();
  }

  const analysis = useMemo(() => {
    const p1 = parseNumOrNull(committed.p1);
    const p2 = parseNumOrNull(committed.p2);
    const d1 = parseNumOrNull(committed.d1);
    const d2 = parseNumOrNull(committed.d2);

    if (p1 === null || p2 === null || d1 === null || d2 === null) {
      return { ready: false as const };
    }

    // Plaintiff slope per round
    const pSlope = p2 - p1;
    // Defendant slope per round
    const dSlope = d2 - d1;

    // Lines: P(r) = p1 + pSlope*(r-1), D(r) = d1 + dSlope*(r-1)
    // Intersection: p1 + pSlope*(r-1) = d1 + dSlope*(r-1)
    // (pSlope - dSlope)*(r-1) = d1 - p1
    const slopeDiff = pSlope - dSlope;

    if (Math.abs(slopeDiff) < Math.abs(Math.max(pSlope, dSlope, 1)) * 1e-10) {
      // Parallel lines
      if (Math.abs(p1 - d1) < 0.01) {
        return { ready: true as const, converges: false as const, reason: "Offers are identical — no convergence needed." };
      }
      return { ready: true as const, converges: false as const, reason: "Trends are parallel and will not intersect." };
    }

    const r = 1 + (d1 - p1) / slopeDiff;

    // Intersection must be in the future (after round 2)
    if (r < 2) {
      return { ready: true as const, converges: false as const, reason: "Trends are diverging — no future convergence." };
    }

    const value = p1 + pSlope * (r - 1);

    return {
      ready: true as const,
      converges: true as const,
      data: { p1, p2, d1, d2, intersectRound: r, intersectValue: value },
    };
  }, [committed]);

  function clearAll() {
    setP1Str("");
    setP2Str("");
    setD1Str("");
    setD2Str("");
    setCommitted({ p1: "", p2: "", d1: "", d2: "" });
  }

  const hasAny = p1Str !== "" || p2Str !== "" || d1Str !== "" || d2Str !== "";

  const inputClass =
    "w-full pl-7 pr-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Plaintiff */}
        <Card className="bg-white border-brand-border">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: BLUE }} />
              <span className="text-sm font-semibold text-brand-primary">Plaintiff</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Offer 1
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
                <input
                  ref={p1Ref}
                  type="text"
                  inputMode="numeric"
                  value={p1Str}
                  onChange={(e) => handleInput(e, setP1Str, p1Ref)}
                  onBlur={commit}
                  onKeyDown={handleKeyDown}
                  placeholder="500,000"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Offer 2
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
                <input
                  ref={p2Ref}
                  type="text"
                  inputMode="numeric"
                  value={p2Str}
                  onChange={(e) => handleInput(e, setP2Str, p2Ref)}
                  onBlur={commit}
                  onKeyDown={handleKeyDown}
                  placeholder="400,000"
                  className={inputClass}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Defendant */}
        <Card className="bg-white border-brand-border">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: RED }} />
              <span className="text-sm font-semibold text-brand-primary">Defendant</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Offer 1
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
                <input
                  ref={d1Ref}
                  type="text"
                  inputMode="numeric"
                  value={d1Str}
                  onChange={(e) => handleInput(e, setD1Str, d1Ref)}
                  onBlur={commit}
                  onKeyDown={handleKeyDown}
                  placeholder="50,000"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Offer 2
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">$</span>
                <input
                  ref={d2Ref}
                  type="text"
                  inputMode="numeric"
                  value={d2Str}
                  onChange={(e) => handleInput(e, setD2Str, d2Ref)}
                  onBlur={commit}
                  onKeyDown={handleKeyDown}
                  placeholder="150,000"
                  className={inputClass}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {hasAny && (
        <div className="flex gap-3">
          <Button onClick={commit}>
            Update Graph
          </Button>
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
        </div>
      )}

      {/* Chart */}
      <Card className="bg-white border-brand-border">
        <CardContent className="pt-6">
          {analysis.ready && analysis.converges ? (
            <>
              <TrendChart data={analysis.data} />

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-brand-muted">
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: BLUE }} />
                  Plaintiff
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: RED }} />
                  Defendant
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: GREEN }} />
                  Projected intersection
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 border-t-2 border-dashed border-brand-muted" />
                  Extrapolation
                </span>
              </div>

              {/* Callout */}
              <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
                Projected intersection: <span className="font-semibold">{fmt(Math.round(analysis.data.intersectValue))}</span> at round{" "}
                <span className="font-semibold">
                  {analysis.data.intersectRound % 1 === 0
                    ? analysis.data.intersectRound
                    : analysis.data.intersectRound.toFixed(1)}
                </span>
              </div>
            </>
          ) : analysis.ready && !analysis.converges ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-brand-caution font-medium">No convergence</p>
                <p className="text-sm text-brand-muted mt-1">{analysis.reason}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-brand-muted text-sm">Enter all four offers to see the projection</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
