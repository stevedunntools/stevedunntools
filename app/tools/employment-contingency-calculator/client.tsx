"use client";

import ClearAllButton from "@/components/clear-all-button";
import ToolCard from "@/components/tool-card";
import { calculateEmploymentContingency } from "./calculate";
import PrintInputs from "@/components/print-inputs";
import { useSessionState, clearSessionKeys, useHydrated } from "@/lib/use-session-state";
import { fmt, parseNumNonNeg } from "@/lib/format";
import { Row, Separator } from "@/components/breakdown-table";
import DollarInput from "@/components/dollar-input";
import PercentSlider from "@/components/percent-slider";
import ResultsShell from "@/components/results-shell";
import MobileResultBar from "@/components/mobile-result-bar";

export default function EmploymentContingencyClient() {
  const hydrated = useHydrated();
  const [settlement, setSettlement] = useSessionState("tool:emp-contingency:settlement", "");
  const [contingencyPct, setContingencyPct] = useSessionState("tool:emp-contingency:contingencyPct", 0);
  const [costs, setCosts] = useSessionState("tool:emp-contingency:costs", "");
  const [wagesPct, setWagesPct] = useSessionState("tool:emp-contingency:wagesPct", 50);
  const [notCovered, setNotCovered] = useSessionState("tool:emp-contingency:notCovered", "");
  const [hasNotCovered, setHasNotCovered] = useSessionState("tool:emp-contingency:hasNotCovered", false);

  function clearAll() {
    setSettlement("");
    setContingencyPct(0);
    setCosts("");
    setWagesPct(50);
    setNotCovered("");
    setHasNotCovered(false);
    clearSessionKeys("tool:emp-contingency:");
  }

  const s = parseNumNonNeg(settlement);
  const c = parseNumNonNeg(costs);
  const nc = hasNotCovered ? parseNumNonNeg(notCovered) : 0;
  const { covered, attorneyFee, netToPlaintiff, wages, nonWage } = calculateEmploymentContingency({ settlement: s, feePct: contingencyPct, costs: c, wagesPct, notCovered: nc });

  const hasAny = settlement !== "" || costs !== "" || notCovered !== "" || hasNotCovered;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6 print:hidden">
        <ToolCard title="Settlement" contentClassName="space-y-4">
            <div className="max-w-[calc(50%-0.5rem)]">
              <label
                htmlFor="emp-contingency-settlement"
                className="block text-sm font-medium text-brand-primary mb-1.5"
              >
                Settlement amount
              </label>
              <DollarInput
                id="emp-contingency-settlement"
                value={settlement}
                onChange={setSettlement}
                placeholder="e.g. 250,000"
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
                <label
                  htmlFor="emp-contingency-not-covered"
                  className="block text-sm font-medium text-brand-primary mb-1.5"
                >
                  Amount of settlement not covered by contingency
                </label>
                <DollarInput
                  id="emp-contingency-not-covered"
                  value={notCovered}
                  onChange={setNotCovered}
                  placeholder="e.g. 100,000"
                />
              </div>
            )}
          </ToolCard>

        <ToolCard title="Contingency Fee">
            <PercentSlider
              value={contingencyPct}
              onChange={setContingencyPct}
              min={0}
              max={100}
              label="Use slider or type exact percentage (ex. 33.333%)"
              aria-label="Contingency fee percentage"
            />
          </ToolCard>

        <ToolCard title="Costs">
            <div className="max-w-[calc(50%-0.5rem)]">
              <label
                htmlFor="emp-contingency-costs"
                className="block text-sm font-medium text-brand-primary mb-1.5"
              >
                Litigation costs
              </label>
              <DollarInput
                id="emp-contingency-costs"
                value={costs}
                onChange={setCosts}
                placeholder="e.g. 10,000"
              />
            </div>
          </ToolCard>

        <ToolCard title="Allocated to Wages">
            <PercentSlider
              value={wagesPct}
              onChange={setWagesPct}
              min={0}
              max={100}
              label="Percentage of plaintiff's net recovery allocated to wages"
              aria-label="Percentage of net recovery allocated to wages"
            />
          </ToolCard>

        <ClearAllButton show={hasAny} onClick={clearAll} />
      </div>

      <PrintInputs items={[
        { label: "Settlement amount", value: settlement ? "$" + settlement : "" },
        { label: "Not covered by contingency", value: hasNotCovered && notCovered ? "$" + notCovered : "" },
        { label: "Contingency fee", value: `${contingencyPct}%` },
        { label: "Wages share", value: `${wagesPct}%` },
        { label: "Litigation costs", value: costs ? "$" + costs : "" },
      ]} />
      {/* Results */}
      <div className="lg:col-span-2">
        <ResultsShell
          label="Net to Plaintiff"
          value={hydrated && hasAny ? fmt(netToPlaintiff) : "—"}
        >
          <ToolCard title="Breakdown">
              <table className="w-full text-sm">
                <tbody>
                  <Row label="Settlement amount" value={hydrated && hasAny ? s : "—"} />
                  <Row
                    label={
                      !hydrated
                        ? "Attorney fee"
                        : nc > 0
                          ? `Attorney fee (${contingencyPct}% of ${fmt(covered)})`
                          : `Attorney fee (${contingencyPct}%)`
                    }
                    value={hydrated && hasAny ? attorneyFee : "—"}
                    negative
                  />
                  <Row label="Costs" value={hydrated && hasAny ? c : "—"} negative />
                  <Row label="Net to plaintiff" value={hydrated && hasAny ? netToPlaintiff : "—"} bold />
                  <Separator />
                  <Row
                    label={hydrated ? `Wage portion of plaintiff's net (W-2, ${wagesPct}%)` : "Wage portion of plaintiff's net (W-2)"}
                    value={hydrated && hasAny ? wages : "—"}
                  />
                  <Row
                    label={hydrated ? `Non-wage portion of plaintiff's net (1099, ${100 - wagesPct}%)` : "Non-wage portion of plaintiff's net (1099)"}
                    value={hydrated && hasAny ? nonWage : "—"}
                  />
                </tbody>
              </table>
              <p className="mt-3 text-xs text-brand-muted">
                The allocation splits the plaintiff&apos;s net recovery after
                attorney fees and costs.
              </p>
            </ToolCard>
        </ResultsShell>
      </div>
      <MobileResultBar label="Net to plaintiff" value={hydrated && hasAny ? fmt(netToPlaintiff) : "—"} />
    </div>
  );
}
