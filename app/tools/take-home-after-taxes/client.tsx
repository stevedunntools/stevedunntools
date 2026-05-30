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
import { calculate, Income1099Type } from "./calculate";
import { STATES, FilingStatus } from "./tax-data";

const filingStatusOptions: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "mfj", label: "Married Filing Jointly" },
  { value: "mfs", label: "Married Filing Separately" },
  { value: "hoh", label: "Head of Household" },
];

const selectClass =
  "w-full px-3 py-2 text-sm border border-brand-border rounded-md bg-white text-brand-primary focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent";

export default function TakeHomeAfterTaxesClient() {
  const [filingStatus, setFilingStatus] = useSessionState<FilingStatus>(
    "tool:take-home:filingStatus",
    "single"
  );
  const [stateCode, setStateCode] = useSessionState<string>("tool:take-home:state", "NC");
  const [w2, setW2] = useSessionState<string>("tool:take-home:w2", "");
  const [income1099, setIncome1099] = useSessionState<string>("tool:take-home:1099", "");
  const [income1099Type, setIncome1099Type] = useSessionState<Income1099Type>(
    "tool:take-home:1099Type",
    "se"
  );
  const [pi, setPi] = useSessionState<string>("tool:take-home:pi", "");

  const [committed, setCommitted] = useSessionState("tool:take-home:committed", {
    w2: "",
    income1099: "",
    pi: "",
  });

  function commit() {
    setCommitted({ w2, income1099, pi });
  }

  function clearAll() {
    setFilingStatus("single");
    setStateCode("NC");
    setW2("");
    setIncome1099("");
    setIncome1099Type("se");
    setPi("");
    setCommitted({ w2: "", income1099: "", pi: "" });
    clearSessionKeys("tool:take-home:");
  }

  const result = useMemo(() => {
    return calculate({
      filingStatus,
      stateCode,
      w2Wages: parseNum(committed.w2),
      income1099: parseNum(committed.income1099),
      income1099Type,
      piIncome: parseNum(committed.pi),
    });
  }, [filingStatus, stateCode, income1099Type, committed]);

  const hasAny =
    w2 !== "" || income1099 !== "" || pi !== "";
  const hasResults = result.totals.gross > 0;
  const state = STATES.find((s) => s.code === stateCode)!;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6">
        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">Filing Status & State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-primary mb-1.5">
                  Filing status
                </label>
                <select
                  value={filingStatus}
                  onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
                  className={selectClass}
                >
                  {filingStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-primary mb-1.5">
                  State
                </label>
                <select
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className={selectClass}
                >
                  {STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}{s.hasIncomeTax ? "" : " (no income tax)"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-brand-border">
          <CardHeader>
            <CardTitle className="text-brand-primary text-base">Income</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                W-2 wages
              </label>
              <DollarInput value={w2} onChange={setW2} onCommit={commit} placeholder="0" />
              <p className="mt-1 text-xs text-brand-muted">
                Employee compensation subject to FICA and federal/state income tax.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                1099 income
              </label>
              <DollarInput
                value={income1099}
                onChange={setIncome1099}
                onCommit={commit}
                placeholder="0"
              />
              <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-4">
                <label className="flex items-center gap-2 text-sm text-brand-primary cursor-pointer">
                  <input
                    type="radio"
                    name="1099-type"
                    checked={income1099Type === "se"}
                    onChange={() => setIncome1099Type("se")}
                    className="h-4 w-4 text-brand-accent focus:ring-brand-accent"
                  />
                  Self-employment (subject to SE tax)
                </label>
                <label className="flex items-center gap-2 text-sm text-brand-primary cursor-pointer">
                  <input
                    type="radio"
                    name="1099-type"
                    checked={income1099Type === "other"}
                    onChange={() => setIncome1099Type("other")}
                    className="h-4 w-4 text-brand-accent focus:ring-brand-accent"
                  />
                  Other (no SE tax)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-primary mb-1.5">
                Tax-free personal injury settlement
              </label>
              <DollarInput value={pi} onChange={setPi} onCommit={commit} placeholder="0" />
              <p className="mt-1 text-xs text-brand-muted">
                Damages on account of physical injury, excluded under IRC §104(a)(2).
                Punitive damages and pre-judgment interest are <em>not</em>{" "}
                excluded — don&apos;t enter those here.
              </p>
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
              <p className="text-sm text-brand-muted mb-1">Estimated Take-Home</p>
              <p className="text-3xl font-bold text-brand-accent">
                {fmt(result.totals.net)}
              </p>
              {hasResults && (
                <p className="text-xs text-brand-muted mt-2">
                  {fmt(result.totals.gross)} gross · {fmt(result.totals.totalTax)} in
                  taxes · {(result.notes.effectiveRate * 100).toFixed(1)}% effective rate
                </p>
              )}
            </CardContent>
          </Card>

          {hasResults && (
            <>
              {/* By category */}
              <Card className="bg-white border-brand-border">
                <CardHeader>
                  <CardTitle className="text-brand-primary text-base">By income category</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <tbody>
                      {result.categories.map((cat, i) => (
                        <CategoryBlock key={i} cat={cat} />
                      ))}
                      <tr>
                        <td className="py-2 font-semibold text-brand-primary">Total take-home</td>
                        <td className="py-2 text-right font-semibold text-brand-accent tabular-nums">
                          {fmt(result.totals.net)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* By tax type */}
              <Card className="bg-white border-brand-border">
                <CardHeader>
                  <CardTitle className="text-brand-primary text-base">By tax type</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <tbody>
                      <Row label="Federal income tax" value={result.totals.federalIncomeTax} />
                      {result.totals.fica > 0 && (
                        <Row label="FICA (Social Security + Medicare)" value={result.totals.fica} />
                      )}
                      {result.totals.seTax > 0 && (
                        <Row label="Self-employment tax" value={result.totals.seTax} />
                      )}
                      {result.totals.stateIncomeTax > 0 && (
                        <Row
                          label={`${state.name} income tax`}
                          value={result.totals.stateIncomeTax}
                        />
                      )}
                      {result.notes.statePayrollBreakdown.map((p) => (
                        <Row
                          key={p.name}
                          label={`${state.code} ${p.name}`}
                          value={p.amount}
                        />
                      ))}
                      <Separator />
                      <Row label="Total taxes" value={result.totals.totalTax} bold />
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </>
          )}

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6 space-y-3 text-xs text-amber-900 leading-relaxed">
              <p className="font-semibold text-sm text-amber-900">
                Disclaimer
              </p>
              <p>
                This tool is provided for illustrative purposes only. It is an estimate
                — not a guarantee, warranty, or representation of the actual tax that
                will be owed on any income. The underlying tax rates, brackets, wage
                bases, and program rules are subject to change, may be inaccurate, may
                not be current, and may not reflect every adjustment, credit, or
                special rule that applies to your situation.
              </p>
              <p>
                This is <strong>not tax advice</strong> and is not a substitute for
                advice from a qualified tax professional. You are solely responsible
                for paying your taxes correctly and on time, including any amounts not
                captured by this estimator. By using this tool you agree that neither
                Steve Dunn nor stevedunntools.com bears any responsibility for
                decisions you make in reliance on the output.
              </p>
              <p>
                The calculator does <strong>not</strong>{" "}account for: local (city or
                county) income taxes; pre-tax deductions like 401(k), HSA, or health
                premiums; itemized deductions; tax credits (child tax credit, EITC,
                etc.); the Net Investment Income Tax; capital gains; the alternative
                minimum tax; QBI&apos;s SSTB and W-2-wage limitations; or state
                phaseouts of standard deductions and personal exemptions. Head of
                Household and Married Filing Separately at the state level default to
                Single brackets where the state does not maintain separate schedules.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-brand-border">
            <CardContent className="pt-6 space-y-2 text-xs text-brand-muted leading-relaxed">
              <p className="font-semibold text-sm text-brand-primary">Sources</p>
              <p>
                Federal brackets, standard deduction, and QBI thresholds:{" "}
                <a
                  href="https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill"
                  target="_blank"
                  rel="noopener"
                  className="text-brand-accent hover:underline"
                >
                  IRS Rev. Proc. 2025-32 (2026 inflation adjustments)
                </a>
                .
              </p>
              <p>
                Social Security wage base ($184,500) and 2026 COLA:{" "}
                <a
                  href="https://www.ssa.gov/news/en/cola/factsheets/2026.html"
                  target="_blank"
                  rel="noopener"
                  className="text-brand-accent hover:underline"
                >
                  SSA 2026 Fact Sheet
                </a>
                .
              </p>
              <p>
                State income tax brackets, standard deductions, and personal
                exemptions:{" "}
                <a
                  href="https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/"
                  target="_blank"
                  rel="noopener"
                  className="text-brand-accent hover:underline"
                >
                  Tax Foundation, 2026 State Individual Income Tax Rates and Brackets
                </a>
                .
              </p>
              <p>
                State payroll programs (SDI / PFL / PFML / FAMLI / TDI): individual
                state agency sources, including{" "}
                <a href="https://edd.ca.gov/" target="_blank" rel="noopener" className="text-brand-accent hover:underline">CA EDD</a>,{" "}
                <a href="https://famli.colorado.gov/" target="_blank" rel="noopener" className="text-brand-accent hover:underline">CO FAMLI</a>,{" "}
                <a href="https://ctpaidleave.org/" target="_blank" rel="noopener" className="text-brand-accent hover:underline">CT Paid Leave</a>,{" "}
                <a href="https://www.mass.gov/info-details/paid-family-and-medical-leave-employer-contribution-rates-and-calculator" target="_blank" rel="noopener" className="text-brand-accent hover:underline">MA PFML</a>,{" "}
                <a href="https://paidleave.mn.gov/" target="_blank" rel="noopener" className="text-brand-accent hover:underline">MN Paid Leave</a>,{" "}
                <a href="https://www.nj.gov/labor/myleavebenefits/" target="_blank" rel="noopener" className="text-brand-accent hover:underline">NJ TDI/FLI</a>,{" "}
                <a href="https://paidfamilyleave.ny.gov/2026" target="_blank" rel="noopener" className="text-brand-accent hover:underline">NY PFL</a>,{" "}
                <a href="https://paidleave.oregon.gov/" target="_blank" rel="noopener" className="text-brand-accent hover:underline">OR Paid Leave</a>,{" "}
                <a href="https://dlt.ri.gov/individuals/temporary-disability-caregiver-insurance" target="_blank" rel="noopener" className="text-brand-accent hover:underline">RI TDI</a>,{" "}
                <a href="https://paidleave.wa.gov/" target="_blank" rel="noopener" className="text-brand-accent hover:underline">WA PFML</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CategoryBlock({ cat }: { cat: ReturnType<typeof calculate>["categories"][number] }) {
  return (
    <>
      <tr>
        <td colSpan={2} className="pt-3 pb-1 font-medium text-brand-primary">{cat.label}</td>
      </tr>
      <Row label="Gross" value={cat.gross} />
      {cat.federalIncomeTax > 0 && (
        <Row label="Federal income tax" value={cat.federalIncomeTax} negative />
      )}
      {cat.fica > 0 && <Row label="FICA" value={cat.fica} negative />}
      {cat.seTax > 0 && <Row label="Self-employment tax" value={cat.seTax} negative />}
      {cat.stateIncomeTax > 0 && (
        <Row label="State income tax" value={cat.stateIncomeTax} negative />
      )}
      {cat.statePayrollTax > 0 && (
        <Row label="State payroll tax" value={cat.statePayrollTax} negative />
      )}
      <tr>
        <td className="py-1.5 text-sm font-medium text-brand-primary">Net</td>
        <td className="py-1.5 text-right text-sm font-medium text-brand-primary tabular-nums">
          {fmt(cat.net)}
        </td>
      </tr>
    </>
  );
}
