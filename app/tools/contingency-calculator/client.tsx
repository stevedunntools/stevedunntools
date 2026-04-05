"use client";

import { useState, useMemo } from "react";
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

export default function ContingencyCalculatorClient() {
  const [settlement, setSettlement] = useState("");
  const [contingencyPct, setContingencyPct] = useState(33);
  const [costs, setCosts] = useState("");

  const [committed, setCommitted] = useState({
    settlement: "",
    contingencyPct: 33,
    costs: "",
  });

  function commit() {
    setCommitted({
      settlement,
      contingencyPct,
      costs,
    });
  }

  function clearAll() {
    setSettlement("");
    setContingencyPct(33);
    setCosts("");
    setCommitted({
      settlement: "",
      contingencyPct: 33,
      costs: "",
    });
  }

  const calc = useMemo(() => {
    const s = parseNum(committed.settlement);
    const pct = committed.contingencyPct / 100;
    const c = parseNum(committed.costs);

    const attorneyFee = s * pct;
    const netToPlaintiff = s - attorneyFee - c;

    return {
      settlement: s,
      contingencyPct: committed.contingencyPct,
      attorneyFee,
      costs: c,
      netToPlaintiff,
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
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-muted">1%</span>
              <span className="text-lg font-semibold text-brand-accent">{contingencyPct}%</span>
              <span className="text-sm text-brand-muted">50%</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={contingencyPct}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setContingencyPct(val);
                setCommitted((prev) => ({ ...prev, contingencyPct: val }));
              }}
              className="w-full accent-brand-accent"
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
                  <Row label={`Attorney fee (${calc.contingencyPct}%)`} value={calc.attorneyFee} negative />
                  <Row label="Costs" value={calc.costs} negative />
                  <Separator />
                  <tr>
                    <td className="py-2 font-semibold text-brand-primary">Net to plaintiff</td>
                    <td className="py-2 text-right font-semibold text-brand-accent">
                      {fmt(calc.netToPlaintiff)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
