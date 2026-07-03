"use client";

import { useMemo } from "react";
import { useSessionState, clearSessionKeys } from "@/lib/use-session-state";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fmt, parseNumOrNull } from "@/lib/format";
import { generateYTicks, formatTickLabel } from "@/lib/chart-utils";
import DollarInput from "@/components/dollar-input";
import { computeIntersection, desiredMoves } from "./logic";

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
const VIOLET = "#7C3AED";

// White halo rendered behind label text so it stays readable where the
// converging lines pass underneath it.
const LABEL_HALO = {
  stroke: "white",
  strokeWidth: 4,
  strokeLinejoin: "round",
  paintOrder: "stroke",
} as const;

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

interface DesiredPoint {
  round: number;
  value: number;
}

function TrendChart({ data, desired }: { data: ChartData; desired?: DesiredPoint | null }) {
  const { p1, p2, d1, d2, intersectRound, intersectValue } = data;

  // Determine how many rounds to show: at least 1 past the intersection (and
  // past the desired meeting point, which can land later), minimum 4
  const maxRound = Math.max(
    Math.ceil(intersectRound) + 1,
    desired ? Math.ceil(desired.round) + 1 : 0,
    4,
  );

  // Y-axis range
  const allVals = [p1, p2, d1, d2, intersectValue];
  const pAtMax = p1 + (p2 - p1) * (maxRound - 1);
  const dAtMax = d1 + (d2 - d1) * (maxRound - 1);
  allVals.push(pAtMax, dAtMax);
  if (desired) allVals.push(desired.value);

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

  // The lines all converge into the meeting points from the left, so the
  // space to the RIGHT of the dots is always empty — labels live there
  // (flipping left only near the right edge). When the two dots sit close in
  // both directions, nudge the violet label vertically clear of the green
  // value label (a single line centered on its dot at intY + 4).
  const sideRight = intX < CHART_W - 110;
  const labelX = sideRight ? intX + 12 : intX - 12;
  const labelAnchor = sideRight ? ("start" as const) : ("end" as const);

  const desiredX = desired ? xScale(desired.round) : null;
  const desiredY = desired ? yScale(desired.value) : null;
  const desiredSideRight = desiredX !== null && desiredX < CHART_W - 110;
  const desiredLabelX = desiredX !== null ? (desiredSideRight ? desiredX + 12 : desiredX - 12) : 0;
  const desiredAnchor = desiredSideRight ? ("start" as const) : ("end" as const);
  let desiredLabelY = desiredY !== null ? desiredY + 4 : 0;
  if (desiredX !== null && desiredY !== null && Math.abs(desiredX - intX) < 24) {
    if (desiredY >= intY) desiredLabelY = Math.max(desiredLabelY, intY + 18);
    else desiredLabelY = Math.min(desiredLabelY, intY - 10);
  }

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

      {/* Desired-settlement overlay: required paths to the selected scenario's meeting point */}
      {desired && desiredX !== null && desiredY !== null && (
        <>
          <path
            d={pathD([{ x: xScale(2), y: yScale(p2) }, { x: desiredX, y: desiredY }])}
            fill="none"
            stroke={VIOLET}
            strokeWidth="1.5"
            strokeDasharray="2 4"
            opacity="0.8"
          />
          <path
            d={pathD([{ x: xScale(2), y: yScale(d2) }, { x: desiredX, y: desiredY }])}
            fill="none"
            stroke={VIOLET}
            strokeWidth="1.5"
            strokeDasharray="2 4"
            opacity="0.8"
          />
          <circle cx={desiredX} cy={desiredY} r="6" fill={VIOLET} stroke="white" strokeWidth="2" />
          <text
            x={desiredLabelX}
            y={desiredLabelY}
            textAnchor={desiredAnchor}
            fontSize="11"
            fontWeight="600"
            fill={VIOLET}
            {...LABEL_HALO}
          >
            {fmt(Math.round(desired.value))}
          </text>
        </>
      )}

      {/* Intersection point */}
      <circle cx={intX} cy={intY} r="6" fill={GREEN} stroke="white" strokeWidth="2" />

      {/* Intersection label */}
      <text
        x={labelX}
        y={intY + 4}
        textAnchor={labelAnchor}
        fontSize="11"
        fontWeight="600"
        fill={GREEN}
        {...LABEL_HALO}
      >
        {fmt(Math.round(intersectValue))}
      </text>
    </svg>
  );
}

/** "4 moves", "1 move", "3.8 moves" — whole numbers shown clean. */
function fmtMoves(n: number): string {
  const shown = n % 1 === 0 ? n.toString() : n.toFixed(1);
  return `${shown} ${shown === "1" ? "move" : "moves"}`;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ConvergenceCalculatorClient() {
  const [p1Str, setP1Str] = useSessionState("tool:convergence:p1", "");
  const [p2Str, setP2Str] = useSessionState("tool:convergence:p2", "");
  const [d1Str, setD1Str] = useSessionState("tool:convergence:d1", "");
  const [d2Str, setD2Str] = useSessionState("tool:convergence:d2", "");
  const [desiredStr, setDesiredStr] = useSessionState("tool:convergence:desired", "");
  const [desiredScenario, setDesiredScenario] = useSessionState<
    "same" | "plaintiff" | "defendant"
  >("tool:convergence:desiredScenario", "same");

  const analysis = useMemo(() => {
    const p1 = parseNumOrNull(p1Str);
    const p2 = parseNumOrNull(p2Str);
    const d1 = parseNumOrNull(d1Str);
    const d2 = parseNumOrNull(d2Str);

    if (p1 === null || p2 === null || d1 === null || d2 === null) {
      return { ready: false as const };
    }

    const result = computeIntersection({ p1, p2, d1, d2 });
    if (!result.converges) {
      return { ready: true as const, converges: false as const, reason: result.reason };
    }

    return {
      ready: true as const,
      converges: true as const,
      data: {
        p1,
        p2,
        d1,
        d2,
        intersectRound: result.intersectRound,
        intersectValue: result.intersectValue,
      },
    };
  }, [p1Str, p2Str, d1Str, d2Str]);

  const desired = useMemo(() => {
    if (!analysis.ready || !analysis.converges) return null;
    const target = parseNumOrNull(desiredStr);
    if (target === null) return null;
    const { p1, p2, d1, d2 } = analysis.data;
    const result = desiredMoves({ p1, p2, d1, d2 }, target);
    return result === null ? null : { target, result };
  }, [analysis, desiredStr]);

  const desiredOk =
    desired && desired.result.kind === "ok"
      ? { target: desired.target, ...desired.result }
      : null;

  // Fall back to the same-moves scenario when a hold scenario is selected but
  // unavailable for the current inputs (e.g. that side isn't moving).
  const effectiveScenario =
    desiredScenario === "plaintiff" && desiredOk?.holdPlaintiff
      ? ("plaintiff" as const)
      : desiredScenario === "defendant" && desiredOk?.holdDefendant
        ? ("defendant" as const)
        : ("same" as const);

  // Meeting point for the selected scenario, drawn on the chart. Moves are
  // counted after each side's second offer, so round = 2 + moves.
  const desiredPoint = desiredOk
    ? effectiveScenario === "plaintiff"
      ? { round: 2 + desiredOk.holdPlaintiff!.moves, value: desiredOk.target }
      : effectiveScenario === "defendant"
        ? { round: 2 + desiredOk.holdDefendant!.moves, value: desiredOk.target }
        : { round: 2 + desiredOk.movesRemaining, value: desiredOk.target }
    : null;

  function clearAll() {
    setP1Str("");
    setP2Str("");
    setD1Str("");
    setD2Str("");
    setDesiredStr("");
    setDesiredScenario("same");
    clearSessionKeys("tool:convergence:");
  }

  const hasAny = p1Str !== "" || p2Str !== "" || d1Str !== "" || d2Str !== "";

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
              <DollarInput
                value={p1Str}
                onChange={setP1Str}
                placeholder="500,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Offer 2
              </label>
              <DollarInput
                value={p2Str}
                onChange={setP2Str}
                placeholder="400,000"
              />
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
              <DollarInput
                value={d1Str}
                onChange={setD1Str}
                placeholder="50,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Offer 2
              </label>
              <DollarInput
                value={d2Str}
                onChange={setD2Str}
                placeholder="150,000"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {hasAny && (
        <Button variant="outline" onClick={clearAll}>
          Clear All
        </Button>
      )}

      {/* Desired settlement number */}
      {analysis.ready && analysis.converges && (
        <Card className="bg-white border-brand-border">
          <CardContent className="pt-6 space-y-3">
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Desired settlement number (optional)
              </label>
              <DollarInput
                value={desiredStr}
                onChange={setDesiredStr}
                placeholder="250,000"
              />
              <p className="mt-1.5 text-xs text-brand-muted">
                See what the moves would have to look like to land somewhere
                other than the projected intersection, in the same number of
                moves.
              </p>
            </div>

            {desiredOk && (
              <div className="px-3 py-2 bg-violet-50 border border-violet-200 rounded-md text-sm text-violet-900 space-y-2.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="desired-scenario"
                    checked={effectiveScenario === "same"}
                    onChange={() => setDesiredScenario("same")}
                    className="mt-0.5 h-4 w-4 shrink-0 border-violet-300 text-brand-accent focus:ring-brand-accent"
                  />
                  <span>
                    To reach <span className="font-semibold">{fmt(desiredOk.target)}</span> in
                    the same number of moves, the{" "}
                    <span className="font-semibold">{desiredOk.adjustParty}</span> would
                    have to move in increments of{" "}
                    <span className="font-semibold">{fmt(desiredOk.adjustNeeded)}</span>{" "}
                    instead of {fmt(desiredOk.adjustCurrent)}. The{" "}
                    {desiredOk.otherParty}&apos;s moves could ease to{" "}
                    {fmt(desiredOk.otherNeeded)} from {fmt(desiredOk.otherCurrent)}.
                  </span>
                </label>
                {(
                  [
                    ["plaintiff", desiredOk.holdPlaintiff],
                    ["defendant", desiredOk.holdDefendant],
                  ] as const
                )
                  .filter(
                    (entry): entry is [typeof entry[0], NonNullable<(typeof entry)[1]>] =>
                      entry[1] !== null,
                  )
                  .map(([key, s]) => (
                    <label key={key} className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="desired-scenario"
                        checked={effectiveScenario === key}
                        onChange={() => setDesiredScenario(key)}
                        className="mt-0.5 h-4 w-4 shrink-0 border-violet-300 text-brand-accent focus:ring-brand-accent"
                      />
                      <span>
                        To reach {fmt(desiredOk.target)} with the {s.heldParty}&apos;s
                        moves staying constant at {fmt(s.heldIncrement)}, the{" "}
                        {s.movingParty} would have to move in increments of{" "}
                        <span className="font-semibold">{fmt(s.neededIncrement)}</span>{" "}
                        instead of {fmt(s.currentIncrement)} — meeting in{" "}
                        {fmtMoves(s.moves)} instead of {fmtMoves(desiredOk.movesRemaining)}.
                      </span>
                    </label>
                  ))}
                <p className="text-xs text-violet-700">
                  The selected scenario is drawn on the chart.
                </p>
              </div>
            )}
            {desired && desired.result.kind === "outside" && (
              <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-900">
                Enter a number between the parties&apos; most recent offers —{" "}
                {fmt(desired.result.low)} and {fmt(desired.result.high)} — to model a
                different landing point.
              </div>
            )}
            {desired && desired.result.kind === "already-there" && (
              <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
                That&apos;s already where the current pattern lands.
              </div>
            )}
            {desired && desired.result.kind === "no-moves-left" && (
              <div className="px-3 py-2 bg-brand-card border border-brand-border rounded-md text-sm text-brand-muted">
                The current trends already meet at the parties&apos; latest offers —
                there are no further moves to adjust.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      <Card className="bg-white border-brand-border">
        <CardContent className="pt-6">
          {analysis.ready && analysis.converges ? (
            <>
              <TrendChart data={analysis.data} desired={desiredPoint} />

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
                  Projected
                </span>
                {desiredOk && (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: VIOLET }} />
                    Desired
                  </span>
                )}
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
