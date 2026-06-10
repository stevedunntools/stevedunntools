"use client";

import { useState, useMemo, useRef, useLayoutEffect } from "react";
import { useSessionState, clearSessionKeys } from "@/lib/use-session-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { fmt, commaFmt } from "@/lib/format";
import { Pt, pointsToPath, generateYTicks, formatTickLabel } from "@/lib/chart-utils";
import { textFieldClass } from "@/lib/field-styles";
import ExportPdfButton from "@/components/export-pdf-button";
import {
  Party,
  OfferType,
  Offer,
  Convergence,
  offerValues,
  parseInput,
  computeConvergence,
  nextRoundFor,
} from "./logic";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HoverInfo =
  | {
      kind: "offer";
      party: Party;
      round: number;
      type: OfferType;
      value: number;
      low: number;
      high: number;
      x: number;
      y: number;
    }
  | { kind: "midpoint"; round: number; value: number; x: number; y: number }
  | {
      kind: "convergence";
      label: string;
      color: string;
      round: number;
      value: number;
      x: number;
      y: number;
    };

/** A projection the user has toggled on, with its computed result. */
interface ActiveProjection {
  label: string;
  color: string;
  data: Convergence;
}

function makeId() {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Chart constants
// ---------------------------------------------------------------------------

const CHART_W = 800;
const CHART_H = 420;
const PAD = { top: 20, right: 30, bottom: 50, left: 80 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

const BLUE = "#4A90D9";
const BLUE_FILL = "rgba(74,144,217,0.15)";
const BLUE_STROKE = "rgba(74,144,217,0.4)";
const RED = "#DC2626";
const RED_FILL = "rgba(220,38,38,0.15)";
const RED_STROKE = "rgba(220,38,38,0.4)";
const GREEN = "#16A34A";
const GREEN_FILL = "rgba(22,163,74,0.30)";

// ---------------------------------------------------------------------------
// Chart geometry helpers (pure — operate on already-scaled coordinates)
// ---------------------------------------------------------------------------

type Scale = (n: number) => number;

function buildBand(
  partyOffers: Offer[],
  xScale: Scale,
  yScale: Scale,
): { polygon: Pt[]; upperEdge: Pt[]; lowerEdge: Pt[] } {
  if (partyOffers.length === 0) return { polygon: [], upperEdge: [], lowerEdge: [] };

  const upperEdge: Pt[] = [];
  const lowerEdge: Pt[] = [];

  for (const m of partyOffers) {
    const v = offerValues(m);
    const x = xScale(m.round);
    upperEdge.push({ x, y: yScale(v.high) });
    lowerEdge.push({ x, y: yScale(v.low) });
  }

  const polygon = [...upperEdge, ...[...lowerEdge].reverse()];
  return { polygon, upperEdge, lowerEdge };
}

function buildLineSegments(
  partyOffers: Offer[],
  xScale: Scale,
  yScale: Scale,
): { solid: Pt[][]; dotted: Pt[][] } {
  const solid: Pt[][] = [];
  const dotted: Pt[][] = [];
  for (let i = 0; i < partyOffers.length - 1; i++) {
    const a = partyOffers[i];
    const b = partyOffers[i + 1];
    const aVal = offerValues(a);
    const bVal = offerValues(b);
    const p1: Pt = { x: xScale(a.round), y: yScale(aVal.mid) };
    const p2: Pt = { x: xScale(b.round), y: yScale(bVal.mid) };

    if (a.type === "number" && b.type === "number") {
      solid.push([p1, p2]);
    } else {
      dotted.push([p1, p2]);
    }
  }
  return { solid, dotted };
}

function buildOfferMidpoints(partyOffers: Offer[], xScale: Scale, yScale: Scale): Pt[] {
  return partyOffers.map((m) => {
    const v = offerValues(m);
    return { x: xScale(m.round), y: yScale(v.mid) };
  });
}

// ---------------------------------------------------------------------------
// Chart component
// ---------------------------------------------------------------------------

interface NegotiationChartProps {
  offers: Offer[];
  showMidpoint: boolean;
  projections: ActiveProjection[];
}

function NegotiationChart({
  offers,
  showMidpoint,
  projections,
}: NegotiationChartProps) {
  const [hover, setHover] = useState<HoverInfo | null>(null);

  const pOffers = useMemo(
    () => offers.filter((m) => m.party === "plaintiff").sort((a, b) => a.round - b.round),
    [offers]
  );
  const dOffers = useMemo(
    () => offers.filter((m) => m.party === "defendant").sort((a, b) => a.round - b.round),
    [offers]
  );

  // Per-round midpoints between the two parties (only rounds where both have offered)
  const roundMidpoints = useMemo(() => {
    const list: { round: number; value: number }[] = [];
    if (offers.length === 0) return list;
    const lastRound = Math.max(...offers.map((m) => m.round));
    for (let r = 1; r <= lastRound; r++) {
      const p = pOffers.find((m) => m.round === r);
      const d = dOffers.find((m) => m.round === r);
      if (p && d) {
        const v = (offerValues(p).mid + offerValues(d).mid) / 2;
        list.push({ round: r, value: v });
      }
    }
    return list;
  }, [offers, pOffers, dOffers]);

  const { rounds, yMin, yMax, xScale, yScale } = useMemo(() => {
    if (offers.length === 0) {
      const mn = 0;
      const mx = 1000000;
      return {
        rounds: 0,
        yMin: mn,
        yMax: mx,
        xScale: (_r: number) => PAD.left + INNER_W / 2,
        yScale: (v: number) => PAD.top + INNER_H - ((v - mn) / (mx - mn)) * INNER_H,
      };
    }

    const actualRounds = Math.max(...offers.map((m) => m.round));
    const allVals: number[] = [];
    for (const m of offers) {
      const e = offerValues(m);
      allVals.push(e.low, e.high);
    }

    // Extend axis bounds when projection/midpoint visuals are shown
    let projRounds = actualRounds;
    for (const proj of projections) {
      projRounds = Math.max(projRounds, Math.ceil(proj.data.round));
      allVals.push(proj.data.value);
    }
    if (showMidpoint) {
      for (const m of roundMidpoints) allVals.push(m.value);
    }

    const rawMin = Math.min(...allVals);
    const rawMax = Math.max(...allVals);
    const padding = Math.max((rawMax - rawMin) * 0.15, Math.abs(rawMax) * 0.1, 1);
    // Anchor the y-axis at zero only when all values are non-negative; otherwise
    // let the axis extend below zero so negative offers render correctly.
    const candidateMin = rawMin - padding;
    const mn = rawMin >= 0 ? Math.max(0, candidateMin) : candidateMin;
    const mx = rawMax + padding;

    return {
      rounds: projRounds,
      yMin: mn,
      yMax: mx,
      xScale: (r: number) => {
        if (projRounds <= 1) return PAD.left + INNER_W / 2;
        return PAD.left + ((r - 1) / (projRounds - 1)) * INNER_W;
      },
      yScale: (v: number) => PAD.top + INNER_H - ((v - mn) / (mx - mn)) * INNER_H,
    };
  }, [offers, projections, showMidpoint, roundMidpoints]);

  const pBand = useMemo(() => buildBand(pOffers, xScale, yScale), [pOffers, xScale, yScale]);
  const dBand = useMemo(() => buildBand(dOffers, xScale, yScale), [dOffers, xScale, yScale]);
  const pLines = useMemo(() => buildLineSegments(pOffers, xScale, yScale), [pOffers, xScale, yScale]);
  const dLines = useMemo(() => buildLineSegments(dOffers, xScale, yScale), [dOffers, xScale, yScale]);

  // Geometric intersection of the two band polygons
  const overlapPolygon = useMemo(() => {
    if (pBand.upperEdge.length < 2 || dBand.upperEdge.length < 2) return [];

    const pMinX = pBand.upperEdge[0].x;
    const pMaxX = pBand.upperEdge[pBand.upperEdge.length - 1].x;
    const dMinX = dBand.upperEdge[0].x;
    const dMaxX = dBand.upperEdge[dBand.upperEdge.length - 1].x;
    const rangeMinX = Math.max(pMinX, dMinX);
    const rangeMaxX = Math.min(pMaxX, dMaxX);

    if (rangeMinX >= rangeMaxX) return [];

    function interpEdge(edge: Pt[], x: number): number {
      if (x <= edge[0].x) return edge[0].y;
      if (x >= edge[edge.length - 1].x) return edge[edge.length - 1].y;
      for (let i = 0; i < edge.length - 1; i++) {
        if (x >= edge[i].x && x <= edge[i + 1].x) {
          const t = (x - edge[i].x) / (edge[i + 1].x - edge[i].x);
          return edge[i].y + t * (edge[i + 1].y - edge[i].y);
        }
      }
      return edge[edge.length - 1].y;
    }

    const STEP = 2;
    const samples: { x: number; topY: number; botY: number; has: boolean }[] = [];

    for (let x = rangeMinX; x <= rangeMaxX; x += STEP) {
      const pTopY = interpEdge(pBand.upperEdge, x);
      const pBotY = interpEdge(pBand.lowerEdge, x);
      const dTopY = interpEdge(dBand.upperEdge, x);
      const dBotY = interpEdge(dBand.lowerEdge, x);

      const topY = Math.max(pTopY, dTopY);
      const botY = Math.min(pBotY, dBotY);

      samples.push({ x, topY, botY, has: topY < botY - 0.5 });
    }

    if (samples.length > 0 && samples[samples.length - 1].x < rangeMaxX) {
      const x = rangeMaxX;
      const pTopY = interpEdge(pBand.upperEdge, x);
      const pBotY = interpEdge(pBand.lowerEdge, x);
      const dTopY = interpEdge(dBand.upperEdge, x);
      const dBotY = interpEdge(dBand.lowerEdge, x);
      const topY = Math.max(pTopY, dTopY);
      const botY = Math.min(pBotY, dBotY);
      samples.push({ x, topY, botY, has: topY < botY - 0.5 });
    }

    const polygons: Pt[][] = [];
    let currentUpper: Pt[] = [];
    let currentLower: Pt[] = [];

    for (const s of samples) {
      if (s.has) {
        currentUpper.push({ x: s.x, y: s.topY });
        currentLower.push({ x: s.x, y: s.botY });
      } else {
        if (currentUpper.length >= 2) {
          polygons.push([...currentUpper, ...[...currentLower].reverse()]);
        }
        currentUpper = [];
        currentLower = [];
      }
    }
    if (currentUpper.length >= 2) {
      polygons.push([...currentUpper, ...[...currentLower].reverse()]);
    }

    return polygons;
  }, [pBand, dBand]);

  const pMidpoints = useMemo(() => buildOfferMidpoints(pOffers, xScale, yScale), [pOffers, xScale, yScale]);
  const dMidpoints = useMemo(() => buildOfferMidpoints(dOffers, xScale, yScale), [dOffers, xScale, yScale]);

  const midpointPts = useMemo(
    () =>
      roundMidpoints.map((m) => ({
        x: xScale(m.round),
        y: yScale(m.value),
        round: m.round,
        value: m.value,
      })),
    [roundMidpoints, xScale, yScale]
  );

  const yTicks = useMemo(() => generateYTicks(yMin, yMax), [yMin, yMax]);

  const xTicks = useMemo(() => {
    if (rounds === 0) return [];
    const maxTicks = 12;
    const stride = Math.max(1, Math.ceil(rounds / maxTicks));
    const ticks: number[] = [];
    for (let r = 1; r <= rounds; r += stride) ticks.push(r);
    if (ticks[ticks.length - 1] !== rounds) ticks.push(rounds);
    return ticks;
  }, [rounds]);

  const TOOLTIP_W = 200;
  const TOOLTIP_H = 76;
  function tooltipPos(x: number, y: number): { tx: number; ty: number } {
    let tx = x + 12;
    let ty = y - TOOLTIP_H - 8;
    if (tx + TOOLTIP_W > CHART_W) tx = x - TOOLTIP_W - 12;
    if (ty < 0) ty = y + 12;
    return { tx, ty };
  }

  /** Props that show/hide a tooltip via mouse, touch, or keyboard focus. */
  function hitAreaProps(info: HoverInfo, label: string) {
    return {
      tabIndex: 0,
      role: "img" as const,
      "aria-label": label,
      style: { cursor: "pointer", outline: "none" },
      onMouseEnter: () => setHover(info),
      onMouseLeave: () => setHover(null),
      onFocus: () => setHover(info),
      onBlur: () => setHover(null),
      onClick: () => setHover(info),
    };
  }

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Negotiation chart showing offers and brackets from both parties"
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
      {xTicks.map((r) => (
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
      {rounds > 0 && (
        <text
          x={PAD.left + INNER_W / 2}
          y={CHART_H - 5}
          textAnchor="middle"
          className="fill-brand-muted"
          fontSize="12"
        >
          Round
        </text>
      )}

      {/* Axis lines */}
      <line
        x1={PAD.left}
        y1={PAD.top}
        x2={PAD.left}
        y2={PAD.top + INNER_H}
        stroke="#D1D5DB"
        strokeWidth="1"
      />
      <line
        x1={PAD.left}
        y1={PAD.top + INNER_H}
        x2={PAD.left + INNER_W}
        y2={PAD.top + INNER_H}
        stroke="#D1D5DB"
        strokeWidth="1"
      />

      {/* Clip path to exclude overlap zones from party fills */}
      {overlapPolygon.length > 0 && (
        <defs>
          <clipPath id="clip-no-overlap">
            <path
              d={`M0,0 H${CHART_W} V${CHART_H} H0 Z ${overlapPolygon
                .map((poly) => pointsToPath(poly, true))
                .join(" ")}`}
              clipRule="evenodd"
            />
          </clipPath>
        </defs>
      )}

      {/* Plaintiff band */}
      {pBand.polygon.length >= 3 && (
        <path
          d={pointsToPath(pBand.polygon, true)}
          fill={BLUE_FILL}
          stroke="none"
          clipPath={overlapPolygon.length > 0 ? "url(#clip-no-overlap)" : undefined}
        />
      )}
      {pBand.upperEdge.length > 1 && (
        <path d={pointsToPath(pBand.upperEdge)} fill="none" stroke={BLUE_STROKE} strokeWidth="1" />
      )}
      {pBand.lowerEdge.length > 1 && (
        <path d={pointsToPath(pBand.lowerEdge)} fill="none" stroke={BLUE_STROKE} strokeWidth="1" />
      )}

      {/* Defendant band */}
      {dBand.polygon.length >= 3 && (
        <path
          d={pointsToPath(dBand.polygon, true)}
          fill={RED_FILL}
          stroke="none"
          clipPath={overlapPolygon.length > 0 ? "url(#clip-no-overlap)" : undefined}
        />
      )}
      {dBand.upperEdge.length > 1 && (
        <path d={pointsToPath(dBand.upperEdge)} fill="none" stroke={RED_STROKE} strokeWidth="1" />
      )}
      {dBand.lowerEdge.length > 1 && (
        <path d={pointsToPath(dBand.lowerEdge)} fill="none" stroke={RED_STROKE} strokeWidth="1" />
      )}

      {/* Green overlap zones */}
      {overlapPolygon.map((poly, i) => (
        <path
          key={`overlap-${i}`}
          d={pointsToPath(poly, true)}
          fill="#16A34A"
          fillOpacity="0.2"
          stroke="none"
        />
      ))}

      {/* Plaintiff lines */}
      {pLines.solid.map((seg, i) => (
        <path key={`p-solid-${i}`} d={pointsToPath(seg)} fill="none" stroke={BLUE} strokeWidth="1.5" />
      ))}
      {pLines.dotted.map((seg, i) => (
        <path
          key={`p-dot-${i}`}
          d={pointsToPath(seg)}
          fill="none"
          stroke={BLUE}
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />
      ))}

      {/* Defendant lines */}
      {dLines.solid.map((seg, i) => (
        <path key={`d-solid-${i}`} d={pointsToPath(seg)} fill="none" stroke={RED} strokeWidth="1.5" />
      ))}
      {dLines.dotted.map((seg, i) => (
        <path
          key={`d-dot-${i}`}
          d={pointsToPath(seg)}
          fill="none"
          stroke={RED}
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />
      ))}

      {/* Per-round midpoint between the parties */}
      {showMidpoint && midpointPts.length > 0 && (
        <>
          {midpointPts.length > 1 && (
            <path
              d={pointsToPath(midpointPts.map((p) => ({ x: p.x, y: p.y })))}
              fill="none"
              stroke={GREEN}
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          )}
          {midpointPts.map((p, i) => (
            <circle
              key={`mid-${i}`}
              cx={p.x}
              cy={p.y}
              r="4"
              fill={GREEN}
              stroke="white"
              strokeWidth="1.5"
            />
          ))}
        </>
      )}

      {/* Projected convergence — one dashed pair + dot per active model */}
      {projections.map((proj) => (
        <g key={`proj-${proj.label}`}>
          <line
            x1={xScale(proj.data.pStart.round)}
            y1={yScale(proj.data.pStart.value)}
            x2={xScale(proj.data.round)}
            y2={yScale(proj.data.value)}
            stroke={proj.color}
            strokeWidth="1.5"
            strokeDasharray="3 4"
            opacity="0.7"
          />
          <line
            x1={xScale(proj.data.dStart.round)}
            y1={yScale(proj.data.dStart.value)}
            x2={xScale(proj.data.round)}
            y2={yScale(proj.data.value)}
            stroke={proj.color}
            strokeWidth="1.5"
            strokeDasharray="3 4"
            opacity="0.7"
          />
          <circle
            cx={xScale(proj.data.round)}
            cy={yScale(proj.data.value)}
            r="4"
            fill={proj.color}
            stroke="white"
            strokeWidth="1.5"
          />
        </g>
      ))}

      {/* Plaintiff dots + hit areas */}
      {pOffers.map((m, i) => {
        const v = offerValues(m);
        const pt = pMidpoints[i];
        return (
          <g key={`p-circ-${m.id}`}>
            <circle cx={pt.x} cy={pt.y} r="4.5" fill={BLUE} stroke="white" strokeWidth="1.5" />
            <circle
              cx={pt.x}
              cy={pt.y}
              r="12"
              fill="transparent"
              {...hitAreaProps(
                {
                  kind: "offer",
                  party: "plaintiff",
                  round: m.round,
                  type: m.type,
                  value: v.mid,
                  low: v.low,
                  high: v.high,
                  x: pt.x,
                  y: pt.y,
                },
                `Plaintiff round ${m.round}: ${
                  m.type === "number" ? fmt(v.mid) : `${fmt(v.low)} to ${fmt(v.high)}`
                }`,
              )}
            />
          </g>
        );
      })}

      {/* Defendant dots + hit areas */}
      {dOffers.map((m, i) => {
        const v = offerValues(m);
        const pt = dMidpoints[i];
        return (
          <g key={`d-circ-${m.id}`}>
            <circle cx={pt.x} cy={pt.y} r="4.5" fill={RED} stroke="white" strokeWidth="1.5" />
            <circle
              cx={pt.x}
              cy={pt.y}
              r="12"
              fill="transparent"
              {...hitAreaProps(
                {
                  kind: "offer",
                  party: "defendant",
                  round: m.round,
                  type: m.type,
                  value: v.mid,
                  low: v.low,
                  high: v.high,
                  x: pt.x,
                  y: pt.y,
                },
                `Defendant round ${m.round}: ${
                  m.type === "number" ? fmt(v.mid) : `${fmt(v.low)} to ${fmt(v.high)}`
                }`,
              )}
            />
          </g>
        );
      })}

      {/* Midpoint dot hit areas */}
      {showMidpoint &&
        midpointPts.map((p, i) => (
          <circle
            key={`mid-hit-${i}`}
            cx={p.x}
            cy={p.y}
            r="12"
            fill="transparent"
            {...hitAreaProps(
              { kind: "midpoint", round: p.round, value: p.value, x: p.x, y: p.y },
              `Midpoint round ${p.round}: ${fmt(p.value)}`,
            )}
          />
        ))}

      {/* Convergence point hit areas */}
      {projections.map((proj) => (
        <circle
          key={`proj-hit-${proj.label}`}
          cx={xScale(proj.data.round)}
          cy={yScale(proj.data.value)}
          r="12"
          fill="transparent"
          {...hitAreaProps(
            {
              kind: "convergence",
              label: proj.label,
              color: proj.color,
              round: proj.data.round,
              value: proj.data.value,
              x: xScale(proj.data.round),
              y: yScale(proj.data.value),
            },
            `${proj.label}: ${fmt(proj.data.value)} at round ${proj.data.round.toFixed(1)}`,
          )}
        />
      ))}

      {/* Empty state */}
      {offers.length === 0 && (
        <text
          x={CHART_W / 2}
          y={CHART_H / 2}
          textAnchor="middle"
          className="fill-brand-muted"
          fontSize="14"
        >
          Add offers below to see the chart
        </text>
      )}

      {/* Tooltip */}
      {hover &&
        (() => {
          const { tx, ty } = tooltipPos(hover.x, hover.y);
          return (
            <foreignObject
              x={tx}
              y={ty}
              width={TOOLTIP_W}
              height={TOOLTIP_H}
              style={{ pointerEvents: "none" }}
            >
              <div
                style={{
                  background: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: 6,
                  padding: "6px 10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  fontSize: 12,
                  lineHeight: 1.35,
                  color: "#111827",
                  fontFamily:
                    "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
                }}
              >
                {hover.kind === "offer" && (
                  <>
                    <div
                      style={{
                        fontWeight: 600,
                        color: hover.party === "plaintiff" ? BLUE : RED,
                      }}
                    >
                      {hover.party === "plaintiff" ? "Plaintiff" : "Defendant"} · Round{" "}
                      {hover.round}
                    </div>
                    {hover.type === "number" ? (
                      <div>{fmt(hover.value)}</div>
                    ) : (
                      <>
                        <div>Midpoint: {fmt(hover.value)}</div>
                        <div style={{ color: "#6B7280" }}>
                          Range: {fmt(hover.low)} – {fmt(hover.high)}
                        </div>
                      </>
                    )}
                  </>
                )}
                {hover.kind === "midpoint" && (
                  <>
                    <div style={{ fontWeight: 600, color: GREEN }}>
                      Midpoint · Round {hover.round}
                    </div>
                    <div>{fmt(hover.value)}</div>
                  </>
                )}
                {hover.kind === "convergence" && (
                  <>
                    <div style={{ fontWeight: 600, color: hover.color }}>
                      {hover.label}
                    </div>
                    <div>Round {hover.round.toFixed(1)}</div>
                    <div>{fmt(hover.value)}</div>
                  </>
                )}
              </div>
            </foreignObject>
          );
        })()}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export default function NegotiationVisualizerClient() {
  const [offers, setOffers] = useSessionState<Offer[]>("tool:neg-viz:offers", []);

  const [party, setParty] = useSessionState<Party>("tool:neg-viz:party", "plaintiff");
  const [showMidpoint, setShowMidpoint] = useSessionState<boolean>(
    "tool:neg-viz:showMidpoint",
    false
  );
  const [showConvergence, setShowConvergence] = useSessionState<boolean>(
    "tool:neg-viz:showConvergence",
    false
  );

  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const plaintiffBtnRef = useRef<HTMLButtonElement>(null);
  const defendantBtnRef = useRef<HTMLButtonElement>(null);
  const offerInputRef = useRef<HTMLInputElement>(null);
  const offerCursorRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (offerCursorRef.current !== null && offerInputRef.current) {
      offerInputRef.current.setSelectionRange(offerCursorRef.current, offerCursorRef.current);
      offerCursorRef.current = null;
    }
  });

  function handleOfferInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const cursor = e.target.selectionStart ?? 0;

    const parts = raw.split("-");
    const formatted = parts
      .map((p) => commaFmt(p.trim()) || p.trim())
      .join(parts.length > 1 ? "-" : "");

    const significantBefore = raw.slice(0, cursor).replace(/[^0-9\-]/g, "").length;
    let newCursor = 0;
    let significant = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/[0-9\-]/.test(formatted[i])) significant++;
      if (significant === significantBefore) {
        newCursor = i + 1;
        break;
      }
    }
    if (significantBefore === 0) newCursor = 0;

    offerCursorRef.current = newCursor;
    setInput(formatted);
    setInputError(null);
  }

  const nextRound = useMemo(() => nextRoundFor(offers), [offers]);

  function addOffer() {
    const parsed = parseInput(input);
    if (!parsed) {
      if (input.trim()) {
        setInputError(
          "Couldn't read that offer. Enter a number like 500,000 or a range like 200,000-400,000."
        );
      }
      return;
    }

    const roundOffers = offers.filter((m) => m.round === nextRound);
    if (roundOffers.some((m) => m.party === party)) {
      setInputError(
        `The ${party} already has an offer in round ${nextRound}. Switch parties or remove the existing offer.`
      );
      return;
    }

    const offer: Offer = {
      id: makeId(),
      round: nextRound,
      party,
      ...parsed,
    };

    setOffers([...offers, offer]);
    setInput("");
    setInputError(null);
    setParty(party === "plaintiff" ? "defendant" : "plaintiff");
  }

  function removeOffer(id: string) {
    setOffers(offers.filter((m) => m.id !== id));
  }

  function clearAll() {
    setOffers([]);
    setParty("plaintiff");
    setInput("");
    setInputError(null);
    setShowConvergence(false);
    clearSessionKeys("tool:neg-viz:");
  }

  const overlapInfo = useMemo(() => {
    const pBrackets = offers
      .filter((m) => m.party === "plaintiff" && m.type === "bracket")
      .sort((a, b) => a.round - b.round);
    const dBrackets = offers
      .filter((m) => m.party === "defendant" && m.type === "bracket")
      .sort((a, b) => a.round - b.round);
    if (pBrackets.length === 0 || dBrackets.length === 0) return null;

    const pLatest = pBrackets[pBrackets.length - 1];
    const dLatest = dBrackets[dBrackets.length - 1];
    const overlapLow = Math.max(pLatest.low, dLatest.low);
    const overlapHigh = Math.min(pLatest.high, dLatest.high);

    if (overlapLow >= overlapHigh) return null;
    return { low: overlapLow, high: overlapHigh };
  }, [offers]);

  const convergence = useMemo(() => computeConvergence(offers), [offers]);
  const convergenceAvailable = convergence !== null;

  const activeProjections: ActiveProjection[] =
    showConvergence && convergence
      ? [{ label: "Projected convergence", color: GREEN, data: convergence }]
      : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Add offer form */}
        <Card className="bg-white border-brand-border lg:col-span-2 print:hidden">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">Add Offer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Party toggle */}
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Party
              </label>
              <div className="flex gap-2">
                <button
                  ref={plaintiffBtnRef}
                  onClick={() => setParty("plaintiff")}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                    party === "plaintiff"
                      ? "bg-[#4A90D9] text-white border-[#4A90D9]"
                      : "bg-white text-brand-muted border-brand-border hover:border-brand-accent"
                  }`}
                >
                  Plaintiff
                </button>
                <button
                  ref={defendantBtnRef}
                  onClick={() => setParty("defendant")}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                    party === "defendant"
                      ? "bg-[#DC2626] text-white border-[#DC2626]"
                      : "bg-white text-brand-muted border-brand-border hover:border-brand-accent"
                  }`}
                >
                  Defendant
                </button>
              </div>
            </div>

            {/* Unified input */}
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Offer
              </label>
              <div className="relative">
                <input
                  ref={offerInputRef}
                  type="text"
                  value={input}
                  onChange={handleOfferInput}
                  onKeyDown={(e) => e.key === "Enter" && addOffer()}
                  onBlur={(e) => {
                    // Don't auto-add when focus moves to a control that changes
                    // the offer's meaning (party toggle) or submits it anyway.
                    if (
                      e.relatedTarget === addButtonRef.current ||
                      e.relatedTarget === plaintiffBtnRef.current ||
                      e.relatedTarget === defendantBtnRef.current
                    ) {
                      return;
                    }
                    if (input.trim()) addOffer();
                  }}
                  placeholder="500,000 or 200,000-400,000"
                  className={textFieldClass}
                />
              </div>
              {inputError ? (
                <p className="mt-1.5 text-xs text-brand-error">{inputError}</p>
              ) : (
                <p className="mt-1.5 text-xs text-brand-muted">
                  Enter a number for a firm offer (e.g. <span className="font-medium">500,000</span>)
                  or a range for a bracket (e.g. <span className="font-medium">200,000-400,000</span>).
                </p>
              )}
            </div>

            <div className="text-xs text-brand-muted">
              Round {nextRound}
              {offers.filter((m) => m.round === nextRound).length > 0 && (
                <>
                  {" "}
                  &mdash;{" "}
                  {offers.find((m) => m.round === nextRound)?.party === "plaintiff"
                    ? "defendant"
                    : "plaintiff"}
                  &apos;s turn
                </>
              )}
            </div>

            <Button ref={addButtonRef} onClick={addOffer} className="w-full">
              Add Offer
            </Button>

            {offers.length > 0 && (
              <Button variant="outline" onClick={clearAll} className="w-full">
                Clear All
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Offer history */}
        <Card className="bg-white border-brand-border lg:col-span-3 print:col-span-full">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">Offer History</CardTitle>
          </CardHeader>
          <CardContent>
            {offers.length === 0 ? (
              <p className="text-sm text-brand-muted py-4 text-center">
                No offers yet. Add your first offer to get started.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-border text-left">
                      <th className="pb-2 pr-3 font-medium text-brand-muted">Round</th>
                      <th className="pb-2 pr-3 font-medium text-brand-muted">Party</th>
                      <th className="pb-2 pr-3 font-medium text-brand-muted">Value</th>
                      <th className="pb-2 w-10 print:hidden"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((m) => (
                      <tr key={m.id} className="border-b border-brand-border/50">
                        <td className="py-2 pr-3 text-brand-primary">{m.round}</td>
                        <td className="py-2 pr-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full text-white ${
                              m.party === "plaintiff" ? "bg-[#4A90D9]" : "bg-[#DC2626]"
                            }`}
                          >
                            {m.party === "plaintiff" ? "P" : "D"}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-brand-primary font-medium">
                          {m.type === "number"
                            ? fmt(m.value)
                            : `${fmt(m.low)} – ${fmt(m.high)} (${fmt((m.low + m.high) / 2)})`}
                        </td>
                        <td className="py-2 print:hidden">
                          <button
                            onClick={() => removeOffer(m.id)}
                            className="p-1 text-brand-muted hover:text-brand-error transition-colors"
                            aria-label={`Remove round ${m.round} ${m.party} offer`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-white border-brand-border">
        <CardContent className="pt-6">
          {/* Display options */}
          <div className="mb-4 space-y-3 print:hidden">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
              <input
                type="checkbox"
                checked={showMidpoint}
                onChange={(e) => setShowMidpoint(e.target.checked)}
                className="h-4 w-4 rounded border-brand-border text-brand-accent focus:ring-brand-accent"
              />
              <span className="text-brand-primary">Show midpoint between offers</span>
            </label>

            {convergenceAvailable && (
              <label className="flex items-start gap-2 select-none text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showConvergence}
                  onChange={(e) => setShowConvergence(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-brand-border text-brand-accent focus:ring-brand-accent"
                />
                <span>
                  <span className="text-brand-primary">Show projected convergence</span>
                  <span className="block text-xs text-brand-muted">
                    A straight-line projection based on each side&apos;s three most
                    recent moves, extended to where the trends meet.
                  </span>
                </span>
              </label>
            )}
          </div>

          <NegotiationChart
            offers={offers}
            showMidpoint={showMidpoint}
            projections={activeProjections}
          />

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-brand-muted">
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: BLUE }}
              />
              Plaintiff
            </span>
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: RED }}
              />
              Defendant
            </span>
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ backgroundColor: GREEN_FILL }}
              />
              Bracket overlap
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 border-t-2 border-dashed border-brand-muted" />
              Bracket midpoint
            </span>
            {showMidpoint && (
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: GREEN }}
                />
                Midpoint between offers
              </span>
            )}
            {activeProjections.map((proj) => (
              <span key={proj.label} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: proj.color }}
                />
                {proj.label}
              </span>
            ))}
          </div>

          {overlapInfo && (
            <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
              Current bracket overlap: {fmt(overlapInfo.low)} &ndash; {fmt(overlapInfo.high)}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="print:hidden">
        <ExportPdfButton />
      </div>
    </div>
  );
}
