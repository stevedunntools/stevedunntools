"use client";

import { useState, useMemo } from "react";
import { fmt } from "@/lib/format";
import {
  CHART_W,
  CHART_H,
  PAD,
  INNER_W,
  INNER_H,
  BLUE,
  RED,
  GREEN,
  pointsToPath,
  generateYTicks,
  formatTickLabel,
} from "@/lib/chart-utils";
import {
  Party,
  OfferType,
  Offer,
  offerValues,
} from "./logic";
import {
  buildBand,
  buildLineSegments,
  buildOfferMidpoints,
  computeOverlapPolygons,
} from "./chart-geometry";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HoverInfo =
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
  | { kind: "midpoint"; round: number; value: number; x: number; y: number };

// ---------------------------------------------------------------------------
// Chart colors (fills/strokes derived from the shared palette)
// ---------------------------------------------------------------------------

export const BLUE_FILL = "rgba(74,144,217,0.15)";
export const BLUE_STROKE = "rgba(74,144,217,0.4)";
export const RED_FILL = "rgba(220,38,38,0.15)";
export const RED_STROKE = "rgba(220,38,38,0.4)";
export const GREEN_FILL = "rgba(22,163,74,0.30)";
export const AMBER = "#B45309";

// ---------------------------------------------------------------------------
// Chart component
// ---------------------------------------------------------------------------

interface NegotiationChartProps {
  offers: Offer[];
  showMidpoint: boolean;
  settlement: number | null;
}

export function NegotiationChart({
  offers,
  showMidpoint,
  settlement,
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

    // Extend axis bounds when midpoint/settlement visuals are shown
    if (showMidpoint) {
      for (const m of roundMidpoints) allVals.push(m.value);
    }
    if (settlement !== null) allVals.push(settlement);

    const rawMin = Math.min(...allVals);
    const rawMax = Math.max(...allVals);
    const padding = Math.max((rawMax - rawMin) * 0.15, Math.abs(rawMax) * 0.1, 1);
    // Anchor the y-axis at zero only when all values are non-negative; otherwise
    // let the axis extend below zero so negative offers render correctly.
    const candidateMin = rawMin - padding;
    const mn = rawMin >= 0 ? Math.max(0, candidateMin) : candidateMin;
    const mx = rawMax + padding;

    return {
      rounds: actualRounds,
      yMin: mn,
      yMax: mx,
      xScale: (r: number) => {
        if (actualRounds <= 1) return PAD.left + INNER_W / 2;
        return PAD.left + ((r - 1) / (actualRounds - 1)) * INNER_W;
      },
      yScale: (v: number) => PAD.top + INNER_H - ((v - mn) / (mx - mn)) * INNER_H,
    };
  }, [offers, showMidpoint, roundMidpoints, settlement]);

  const pBand = useMemo(() => buildBand(pOffers, xScale, yScale), [pOffers, xScale, yScale]);
  const dBand = useMemo(() => buildBand(dOffers, xScale, yScale), [dOffers, xScale, yScale]);
  const pLines = useMemo(() => buildLineSegments(pOffers, xScale, yScale), [pOffers, xScale, yScale]);
  const dLines = useMemo(() => buildLineSegments(dOffers, xScale, yScale), [dOffers, xScale, yScale]);

  // Geometric intersection of the two band polygons
  const overlapPolygon = useMemo(() => computeOverlapPolygons(pBand, dBand), [pBand, dBand]);

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
    <div className="overflow-x-auto">
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full h-auto min-w-[640px] sm:min-w-0"
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

      {/* Settlement line */}
      {settlement !== null && offers.length > 0 && (
        <g>
          <line
            x1={PAD.left}
            y1={yScale(settlement)}
            x2={PAD.left + INNER_W}
            y2={yScale(settlement)}
            stroke={AMBER}
            strokeWidth="2"
            strokeDasharray="7 4"
          />
          <text
            x={PAD.left + INNER_W - 6}
            y={
              yScale(settlement) < PAD.top + 20
                ? yScale(settlement) + 16
                : yScale(settlement) - 8
            }
            textAnchor="end"
            fontSize="12"
            fontWeight="600"
            fill={AMBER}
          >
            Settled: {fmt(settlement)}
          </text>
        </g>
      )}

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
              r="20"
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
              r="20"
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
            r="20"
            fill="transparent"
            {...hitAreaProps(
              { kind: "midpoint", round: p.round, value: p.value, x: p.x, y: p.y },
              `Midpoint round ${p.round}: ${fmt(p.value)}`,
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
          Add offers above to see the chart
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
              </div>
            </foreignObject>
          );
        })()}
    </svg>
    </div>
  );
}
