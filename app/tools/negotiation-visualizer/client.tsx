"use client";

import { useMemo } from "react";
import { useSessionState, clearSessionKeys, useHydrated } from "@/lib/use-session-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { CheckCircle2, FileJson } from "lucide-react";
import { fmt } from "@/lib/format";
import { BLUE, RED, GREEN } from "@/lib/chart-utils";
import ExportPdfButton from "@/components/export-pdf-button";
import {
  Party,
  Offer,
  parseInput,
  computeConvergence,
  nextRoundFor,
  buildExportData,
} from "./logic";
import {
  NegotiationChart,
  ActiveProjection,
  GREEN_FILL,
  AMBER,
} from "./negotiation-chart";
import OfferForm, { SubmitOfferResult } from "./offer-form";
import OfferHistory from "./offer-history";

function makeId() {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export default function NegotiationVisualizerClient() {
  const hydrated = useHydrated();
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
  const [settlementInput, setSettlementInput] = useSessionState<string>(
    "tool:neg-viz:settlement",
    ""
  );

  const settlement = useMemo(() => {
    const n = parseFloat(settlementInput.replace(/[$,\s]/g, ""));
    return Number.isFinite(n) ? n : null;
  }, [settlementInput]);

  // Gate restored offers/settlement until mounted so a previous matter's
  // data doesn't flash on first paint. The input form stays live.
  const displayOffers = useMemo(() => (hydrated ? offers : []), [hydrated, offers]);
  const displaySettlement = hydrated ? settlement : null;

  const nextRound = useMemo(() => nextRoundFor(offers), [offers]);

  function submitOffer(raw: string): SubmitOfferResult {
    const parsed = parseInput(raw);
    if (!parsed) {
      if (raw.trim()) {
        return {
          ok: false,
          error:
            "Couldn't read that offer. Enter a number like 500,000 or a range like 200,000-400,000.",
        };
      }
      return { ok: false, error: null };
    }

    const roundOffers = offers.filter((m) => m.round === nextRound);
    if (roundOffers.some((m) => m.party === party)) {
      return {
        ok: false,
        error: `The ${party} already has an offer in round ${nextRound}. Switch parties or remove the existing offer.`,
      };
    }

    const offer: Offer = {
      id: makeId(),
      round: nextRound,
      party,
      ...parsed,
    };

    setOffers([...offers, offer]);
    setParty(party === "plaintiff" ? "defendant" : "plaintiff");
    return { ok: true, error: null };
  }

  function removeOffer(id: string) {
    setOffers(offers.filter((m) => m.id !== id));
  }

  function exportJson() {
    const data = buildExportData(offers, settlement, new Date().toISOString());
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `negotiation-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    setOffers([]);
    setParty("plaintiff");
    setShowConvergence(false);
    setSettlementInput("");
    clearSessionKeys("tool:neg-viz:");
  }

  const overlapInfo = useMemo(() => {
    const pBrackets = displayOffers
      .filter((m) => m.party === "plaintiff" && m.type === "bracket")
      .sort((a, b) => a.round - b.round);
    const dBrackets = displayOffers
      .filter((m) => m.party === "defendant" && m.type === "bracket")
      .sort((a, b) => a.round - b.round);
    if (pBrackets.length === 0 || dBrackets.length === 0) return null;

    const pLatest = pBrackets[pBrackets.length - 1];
    const dLatest = dBrackets[dBrackets.length - 1];
    const overlapLow = Math.max(pLatest.low, dLatest.low);
    const overlapHigh = Math.min(pLatest.high, dLatest.high);

    if (overlapLow >= overlapHigh) return null;
    return { low: overlapLow, high: overlapHigh };
  }, [displayOffers]);

  const convergence = useMemo(() => computeConvergence(displayOffers), [displayOffers]);
  const convergenceAvailable = convergence !== null;

  const activeProjections: ActiveProjection[] =
    showConvergence && convergence
      ? [{ label: "Projected convergence", color: GREEN, data: convergence }]
      : [];

  return (
    <div className="space-y-6">
      {displaySettlement !== null && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50 border border-green-300 rounded-md">
          <CheckCircle2 className="h-5 w-5 text-green-700 shrink-0" />
          <span className="text-sm font-semibold text-green-900">
            Case settled for {fmt(displaySettlement)}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Add offer form */}
        <OfferForm
          party={party}
          onPartyChange={setParty}
          nextRound={nextRound}
          offers={offers}
          onSubmitOffer={submitOffer}
          onClearAll={clearAll}
          settlementInput={settlementInput}
          onSettlementChange={setSettlementInput}
        />

        {/* Offer history */}
        <OfferHistory offers={displayOffers} onRemove={removeOffer} />
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
            offers={displayOffers}
            showMidpoint={showMidpoint}
            projections={activeProjections}
            settlement={displaySettlement}
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
            {displaySettlement !== null && (
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-4 border-t-2 border-dashed"
                  style={{ borderColor: AMBER }}
                />
                Settlement
              </span>
            )}
          </div>

          {overlapInfo && (
            <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
              Current bracket overlap: {fmt(overlapInfo.low)} &ndash; {fmt(overlapInfo.high)}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="print:hidden flex flex-wrap gap-3">
        <ExportPdfButton />
        <Button variant="outline" onClick={exportJson} disabled={offers.length === 0}>
          <FileJson className="h-4 w-4 mr-1.5" data-icon="inline-start" />
          Export as JSON
        </Button>
      </div>
    </div>
  );
}
