"use client";

import { useSessionState, clearSessionKeys } from "@/lib/use-session-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { fmt, parseNum } from "@/lib/format";
import { Row, Separator } from "@/components/breakdown-table";
import DollarInput from "@/components/dollar-input";
import PercentSlider from "@/components/percent-slider";
import EstimateDisclaimer from "@/components/estimate-disclaimer";
import ExportPdfButton from "@/components/export-pdf-button";
import MobileResultBar from "@/components/mobile-result-bar";

export default function ContingencyCalculatorClient() {
  const [settlement, setSettlement] = useSessionState("tool:contingency:settlement", "");
  const [contingencyPct, setContingencyPct] = useSessionState("tool:contingency:contingencyPct", 0);
  const [costs, setCosts] = useSessionState("tool:contingency:costs", "");
  const [notCovered, setNotCovered] = useSessionState("tool:contingency:notCovered", "");
  const [hasNotCovered, setHasNotCovered] = useSessionState("tool:contingency:hasNotCovered", false);

  function clearAll() {
    setSettlement("");
    setContingencyPct(0);
    setCosts("");
    setNotCovered("");
    setHasNotCovered(false);
    clearSessionKeys("tool:contingency:");
  }

  const s = parseNum(settlement);
  const c = parseNum(costs);
  const nc = hasNotCovered ? parseNum(notCovered) : 0;
  const covered = Math.max(0, s - nc);
  const attorneyFee = covered * (contingencyPct / 100);
  const netToPlaintiff = s - attorneyFee - c;

  const hasAny = settlement !== "" || costs !== "" || notCovered !== "" || hasNotCovered;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6 print:hidden">
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Settlement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-[calc(50%-0.5rem)]">
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Settlement amount
              </label>
              <DollarInput
                value={settlement}
                onChange={setSettlement}
                placeholder="250,000"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
              <input
                type="checkbox"
                checked={hasNotCovered}
                onChange={(e) => setHasNotCovered(e.target.checked)}
                className="h-4 w-4 rounded border-brand-border text-brand-accent focus:ring-brand-accent"
              />
              <span className="text-brand-primary">
                Part of the settlement is not covered by the contingency
              </span>
            </label>
            {hasNotCovered && (
              <div className="max-w-[calc(50%-0.5rem)]">
                <label className="block text-sm font-medium text-brand-primary mb-1.5">
                  Amount of settlement not covered by contingency
                </label>
                <DollarInput
                  value={notCovered}
                  onChange={setNotCovered}
                  placeholder="100,000"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Contingency Fee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PercentSlider
              value={contingencyPct}
              onChange={setContingencyPct}
              min={0}
              max={100}
              label="Use slider or type exact percentage (ex. 33.333%)"
            />
          </CardContent>
        </Card>

        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-[calc(50%-0.5rem)]">
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Litigation costs
              </label>
              <DollarInput
                value={costs}
                onChange={setCosts}
                placeholder="10,000"
              />
            </div>
          </CardContent>
        </Card>

        {hasAny && (
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </div>

      {/* Results */}
      <div className="lg:col-span-2">
        <div className="sticky top-20 space-y-6">
          <Card id="tool-headline-result" className="bg-white border-brand-accent">
            <CardContent className="pt-6">
              <p className="text-sm text-brand-muted mb-1">Net to Plaintiff</p>
              <p className="text-3xl font-bold text-brand-accent">
                {fmt(netToPlaintiff)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-brand-border">
            <CardHeader>
              <CardTitle className="text-brand-primary text-base">Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <tbody>
                  <Row label="Settlement amount" value={s} />
                  <Row
                    label={
                      nc > 0
                        ? `Attorney fee (${contingencyPct}% of ${fmt(covered)})`
                        : `Attorney fee (${contingencyPct}%)`
                    }
                    value={attorneyFee}
                    negative
                  />
                  <Row label="Costs" value={c} negative />
                  <Separator />
                  <tr>
                    <td className="py-2 font-semibold text-brand-primary">Net to plaintiff</td>
                    <td className="py-2 text-right font-semibold text-brand-accent">
                      {fmt(netToPlaintiff)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          <EstimateDisclaimer />
          <div className="print:hidden">
            <ExportPdfButton />
          </div>
        </div>
      </div>
      <MobileResultBar label="Net to plaintiff" value={fmt(netToPlaintiff)} targetId="tool-headline-result" />
    </div>
  );
}
