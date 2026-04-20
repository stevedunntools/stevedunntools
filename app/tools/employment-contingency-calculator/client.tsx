"use client";

import { useMemo } from "react";
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

export default function EmploymentContingencyClient() {
  const [settlement, setSettlement] = useSessionState("tool:emp-contingency:settlement", "");
  const [contingencyPct, setContingencyPct] = useSessionState("tool:emp-contingency:contingencyPct", 1);
  const [costs, setCosts] = useSessionState("tool:emp-contingency:costs", "");
  const [wagesPct, setWagesPct] = useSessionState("tool:emp-contingency:wagesPct", 50);

  const [committed, setCommitted] = useSessionState("tool:emp-contingency:committed", {
    settlement: "",
    contingencyPct: 1,
    costs: "",
    wagesPct: 50,
  });

  function commit() {
    setCommitted({
      settlement,
      contingencyPct,
      costs,
      wagesPct,
    });
  }

  function clearAll() {
    setSettlement("");
    setContingencyPct(33);
    setCosts("");
    setWagesPct(50);
    setCommitted({
      settlement: "",
      contingencyPct: 1,
      costs: "",
      wagesPct: 50,
    });
    clearSessionKeys("tool:emp-contingency:");
  }

  const calc = useMemo(() => {
    const s = parseNum(committed.settlement);
    const feePct = committed.contingencyPct / 100;
    const c = parseNum(committed.costs);
    const wPct = committed.wagesPct / 100;

    const attorneyFee = s * feePct;
    const feeAndCosts = attorneyFee + c;
    const netToPlaintiff = s - feeAndCosts;
    const wages = netToPlaintiff * wPct;
    const nonWage = netToPlaintiff * (1 - wPct);

    return {
      settlement: s,
      contingencyPct: committed.contingencyPct,
      attorneyFee,
      costs: c,
      feeAndCosts,
      netToPlaintiff,
      wagesPct: committed.wagesPct,
      wages,
      nonWage,
    };
  }, [committed]);

  const hasAny = settlement !== "" || costs !== "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6">
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
                onCommit={commit}
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
              onChange={(val) => {
                setContingencyPct(val);
                setCommitted((prev) => ({ ...prev, contingencyPct: val }));
              }}
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
                onCommit={commit}
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
              onChange={(val) => {
                setWagesPct(val);
                setCommitted((prev) => ({ ...prev, wagesPct: val }));
              }}
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
          <Card className="bg-white border-brand-accent">
            <CardContent className="pt-6">
              <p className="text-sm text-brand-muted mb-1">Net to Plaintiff</p>
              <p className="text-3xl font-bold text-brand-accent">
                {fmt(calc.netToPlaintiff)}
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
                  <Row label="Settlement amount" value={calc.settlement} />
                  <Row label={`Attorney fee (${calc.contingencyPct}%) + costs`} value={calc.feeAndCosts} negative />
                  <Row label="Net to plaintiff" value={calc.netToPlaintiff} bold />
                  <Separator />
                  <Row label={`Plaintiff's wages (${calc.wagesPct}%)`} value={calc.wages} />
                  <Row label={`Plaintiff's non-wage income (${100 - calc.wagesPct}%)`} value={calc.nonWage} />
                </tbody>
              </table>
            </CardContent>
          </Card>

          <p className="text-xs text-brand-muted">
            This is an estimate for settlement discussion purposes only. It is
            not legal advice and does not account for all possible factors.
          </p>
        </div>
      </div>
    </div>
  );
}
