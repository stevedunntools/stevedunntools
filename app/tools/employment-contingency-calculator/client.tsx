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

export default function EmploymentContingencyClient() {
  const [settlement, setSettlement] = useSessionState("tool:emp-contingency:settlement", "");
  const [contingencyPct, setContingencyPct] = useSessionState("tool:emp-contingency:contingencyPct", 1);
  const [costs, setCosts] = useSessionState("tool:emp-contingency:costs", "");
  const [wagesPct, setWagesPct] = useSessionState("tool:emp-contingency:wagesPct", 50);

  function clearAll() {
    setSettlement("");
    setContingencyPct(1);
    setCosts("");
    setWagesPct(50);
    clearSessionKeys("tool:emp-contingency:");
  }

  const s = parseNum(settlement);
  const c = parseNum(costs);
  const attorneyFee = s * (contingencyPct / 100);
  const feeAndCosts = attorneyFee + c;
  const netToPlaintiff = s - feeAndCosts;
  const wages = netToPlaintiff * (wagesPct / 100);
  const nonWage = netToPlaintiff - wages;

  const hasAny = settlement !== "" || costs !== "";

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
          <CardContent>
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
              min={1}
              max={100}
              label="Use slider or type exact percentage"
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

        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">
              Allocated to Wages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PercentSlider
              value={wagesPct}
              onChange={setWagesPct}
              min={0}
              max={100}
              label="Percentage of net recovery allocated to wages for tax purposes"
            />
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
                  <Row label={`Attorney fee (${contingencyPct}%) + costs`} value={feeAndCosts} negative />
                  <Row label="Net to plaintiff" value={netToPlaintiff} bold />
                  <Separator />
                  <Row label={`Plaintiff's wages (${wagesPct}%)`} value={wages} />
                  <Row label={`Plaintiff's non-wage income (${100 - wagesPct}%)`} value={nonWage} />
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
