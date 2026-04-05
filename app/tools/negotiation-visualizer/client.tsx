"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { fmt } from "@/lib/format";
import { Pt, pointsToPath, generateYTicks, formatTickLabel } from "@/lib/chart-utils";
import ExportPdfButton from "@/components/export-pdf-button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Party = "plaintiff" | "defendant";
type OfferType = "number" | "bracket";

interface Offer {
  id: string;
  round: number;
  party: Party;
  type: OfferType;
  value: number;
  low: number;
  high: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeId() {
  return crypto.randomUUID();
}

function offerValues(m: Offer): { low: number; high: number; mid: number } {
  if (m.type === "number") return { low: m.value, high: m.value, mid: m.value };
  return { low: m.low, high: m.high, mid: (m.low + m.high) / 2 };
}

/**
 * Parse user input into an offer. Supports:
 *   "500000" or "500,000" → number offer
 *   "200000-400000" or "200,000 - 400,000" → bracket
 */
function parseInput(raw: string): { type: OfferType; value: number; low: number; high: number } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Check for bracket (contains a dash separator between two numbers)
  const bracketMatch = trimmed.match(/^[\s$]*([\d,]+)\s*[-–—]\s*[\s$]*([\d,]+)\s*$/);
  if (bracketMatch) {
    const a = parseFloat(bracketMatch[1].replace(/,/g, ""));
    const b = parseFloat(bracketMatch[2].replace(/,/g, ""));
    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return null;
    const low = Math.min(a, b);
    const high = Math.max(a, b);
    if (low === high) return null;
    return { type: "bracket", value: 0, low, high };
  }

  // Otherwise treat as a single number
  const num = parseFloat(trimmed.replace(/[$,]/g, ""));
  if (isNaN(num) || num <= 0) return null;
  return { type: "number", value: num, low: 0, high: 0 };
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
const GREEN_FILL = "rgba(22,163,74,0.30)";

// ---------------------------------------------------------------------------
// Chart component
// ---------------------------------------------------------------------------

function NegotiationChart({ offers }: { offers: Offer[] }) {
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

    const rs = Math.max(...offers.map((m) => m.round));
    const allVals: number[] = [];
    for (const m of offers) {
      const e = offerValues(m);
      allVals.push(e.low, e.high);
    }
    const rawMin = Math.min(...allVals);
    const rawMax = Math.max(...allVals);
    const padding = Math.max((rawMax - rawMin) * 0.1, 10000);
    const mn = Math.max(0, rawMin - padding);
    const mx = rawMax + padding;

    return {
      rounds: rs,
      yMin: mn,
      yMax: mx,
      xScale: (r: number) => {
        if (rs <= 1) return PAD.left + INNER_W / 2;
        return PAD.left + ((r - 1) / (rs - 1)) * INNER_W;
      },
      yScale: (v: number) => PAD.top + INNER_H - ((v - mn) / (mx - mn)) * INNER_H,
    };
  }, [offers]);

  const pOffers = offers.filter((m) => m.party === "plaintiff").sort((a, b) => a.round - b.round);
  const dOffers = offers.filter((m) => m.party === "defendant").sort((a, b) => a.round - b.round);

  function buildBand(partyOffers: Offer[]): { polygon: Pt[]; upperEdge: Pt[]; lowerEdge: Pt[] } {
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

  // Build line segments: solid between consecutive numbers, dotted when a bracket is involved
  function buildLineSegments(partyOffers: Offer[]): { solid: Pt[][]; dotted: Pt[][] } {
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

  // Build dot positions at midpoints
  function buildMidpoints(partyOffers: Offer[]): Pt[] {
    return partyOffers.map((m) => {
      const v = offerValues(m);
      return { x: xScale(m.round), y: yScale(v.mid) };
    });
  }

  const pBand = useMemo(() => buildBand(pOffers), [offers]);
  const dBand = useMemo(() => buildBand(dOffers), [offers]);
  const pLines = useMemo(() => buildLineSegments(pOffers), [offers]);
  const dLines = useMemo(() => buildLineSegments(dOffers), [offers]);

  // Compute green overlap: the geometric intersection of the two band polygons.
  // Dense sampling across the x-range to catch all overlapping areas.
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

    // Sample densely across the range (every 2 pixels)
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

    // Ensure we include the exact end point
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

    // Build polygon segments from consecutive overlapping samples
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

  const pMidpoints = useMemo(() => buildMidpoints(pOffers), [offers]);
  const dMidpoints = useMemo(() => buildMidpoints(dOffers), [offers]);

  const yTicks = useMemo(() => generateYTicks(yMin, yMax), [yMin, yMax]);

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
      {Array.from({ length: rounds }, (_, i) => i + 1).map((r) => (
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
              d={`M0,0 H${CHART_W} V${CHART_H} H0 Z ${overlapPolygon.map((poly) => pointsToPath(poly, true)).join(" ")}`}
              clipRule="evenodd"
            />
          </clipPath>
        </defs>
      )}

      {/* Plaintiff band (clipped to exclude overlap) */}
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

      {/* Defendant band (clipped to exclude overlap) */}
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

      {/* Green overlap zones (clean, no red/blue underneath) */}
      {overlapPolygon.map((poly, i) => (
        <path key={`overlap-${i}`} d={pointsToPath(poly, true)} fill="#16A34A" fillOpacity="0.2" stroke="none" />
      ))}

      {/* Plaintiff lines: solid between numbers, dotted when brackets involved */}
      {pLines.solid.map((seg, i) => (
        <path key={`p-solid-${i}`} d={pointsToPath(seg)} fill="none" stroke={BLUE} strokeWidth="1.5" />
      ))}
      {pLines.dotted.map((seg, i) => (
        <path key={`p-dot-${i}`} d={pointsToPath(seg)} fill="none" stroke={BLUE} strokeWidth="1.5" strokeDasharray="5 3" />
      ))}

      {/* Defendant lines: solid between numbers, dotted when brackets involved */}
      {dLines.solid.map((seg, i) => (
        <path key={`d-solid-${i}`} d={pointsToPath(seg)} fill="none" stroke={RED} strokeWidth="1.5" />
      ))}
      {dLines.dotted.map((seg, i) => (
        <path key={`d-dot-${i}`} d={pointsToPath(seg)} fill="none" stroke={RED} strokeWidth="1.5" strokeDasharray="5 3" />
      ))}

      {/* Plaintiff dots at midpoints */}
      {pMidpoints.map((p, i) => (
        <circle
          key={`p-circ-${i}`}
          cx={p.x}
          cy={p.y}
          r="4.5"
          fill={BLUE}
          stroke="white"
          strokeWidth="1.5"
        />
      ))}

      {/* Defendant dots at midpoints */}
      {dMidpoints.map((p, i) => (
        <circle
          key={`d-circ-${i}`}
          cx={p.x}
          cy={p.y}
          r="4.5"
          fill={RED}
          stroke="white"
          strokeWidth="1.5"
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
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export default function NegotiationVisualizerClient() {
  const [offers, setOffers] = useState<Offer[]>([]);

  const [party, setParty] = useState<Party>("plaintiff");
  const [input, setInput] = useState("");

  const nextRound = useMemo(() => {
    if (offers.length === 0) return 1;
    const lastRound = Math.max(...offers.map((m) => m.round));
    const lastRoundOffers = offers.filter((m) => m.round === lastRound);
    const hasPlaintiff = lastRoundOffers.some((m) => m.party === "plaintiff");
    const hasDefendant = lastRoundOffers.some((m) => m.party === "defendant");
    if (hasPlaintiff && hasDefendant) return lastRound + 1;
    return lastRound;
  }, [offers]);

  function addOffer() {
    const parsed = parseInput(input);
    if (!parsed) return;

    // Don't allow same party twice in same round
    const roundOffers = offers.filter((m) => m.round === nextRound);
    if (roundOffers.some((m) => m.party === party)) return;

    const offer: Offer = {
      id: makeId(),
      round: nextRound,
      party,
      ...parsed,
    };

    setOffers([...offers, offer]);
    setInput("");
    setParty(party === "plaintiff" ? "defendant" : "plaintiff");
  }

  function removeOffer(id: string) {
    setOffers(offers.filter((m) => m.id !== id));
  }

  function clearAll() {
    setOffers([]);
    setParty("plaintiff");
  }

  // Overlap info for the text callout
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
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addOffer()}
                  onBlur={() => { if (input.trim()) addOffer(); }}
                  placeholder="500,000 or 200,000-400,000"
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                />
              </div>
              <p className="mt-1.5 text-xs text-brand-muted">
                Enter a number for a firm offer (e.g. <span className="font-medium">500,000</span>)
                or a range for a bracket (e.g. <span className="font-medium">200,000-400,000</span>).
              </p>
            </div>

            <div className="text-xs text-brand-muted">
              Round {nextRound}
              {offers.filter((m) => m.round === nextRound).length > 0 && (
                <> &mdash; {offers.find((m) => m.round === nextRound)?.party === "plaintiff" ? "defendant" : "plaintiff"}&apos;s turn</>
              )}
            </div>

            <Button onClick={addOffer} className="w-full">
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
                            : `${fmt(m.low)} – ${fmt(m.high)}`}
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
          <NegotiationChart offers={offers} />

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
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ backgroundColor: GREEN_FILL }}
              />
              Bracket overlap
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 border-t-2 border-dashed border-brand-muted" />
              Midpoint trend
            </span>
          </div>

          {overlapInfo && (
            <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
              Current bracket overlap: {fmt(overlapInfo.low)} &ndash; {fmt(overlapInfo.high)} (midpoint: {fmt((overlapInfo.low + overlapInfo.high) / 2)})
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
