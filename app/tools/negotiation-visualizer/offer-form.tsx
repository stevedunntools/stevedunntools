"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { commaFmt } from "@/lib/format";
import { textFieldClass } from "@/lib/field-styles";
import DollarInput from "@/components/dollar-input";
import { Party, Offer } from "./logic";

/** Result of attempting to add an offer: ok=true means it was added. */
export interface SubmitOfferResult {
  ok: boolean;
  error: string | null;
}

interface OfferFormProps {
  party: Party;
  onPartyChange: (party: Party) => void;
  nextRound: number;
  offers: Offer[];
  onSubmitOffer: (raw: string) => SubmitOfferResult;
  onClearAll: () => void;
  settlementInput: string;
  onSettlementChange: (value: string) => void;
}

export default function OfferForm({
  party,
  onPartyChange,
  nextRound,
  offers,
  onSubmitOffer,
  onClearAll,
  settlementInput,
  onSettlementChange,
}: OfferFormProps) {
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

    const significantBefore = raw.slice(0, cursor).replace(/[^0-9.\-]/g, "").length;
    let newCursor = 0;
    let significant = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/[0-9.\-]/.test(formatted[i])) significant++;
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

  function addOffer() {
    const result = onSubmitOffer(input);
    if (result.ok) {
      setInput("");
      setInputError(null);
    } else if (result.error) {
      setInputError(result.error);
    }
  }

  function clearAll() {
    setInput("");
    setInputError(null);
    onClearAll();
  }

  return (
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
              onClick={() => onPartyChange("plaintiff")}
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
              onClick={() => onPartyChange("defendant")}
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

        {/* Settlement */}
        <div className="pt-4 border-t border-brand-border">
          <label
            htmlFor="neg-viz-settlement"
            className="block text-sm font-medium text-brand-primary mb-1.5"
          >
            Settlement Amount
          </label>
          <DollarInput
            id="neg-viz-settlement"
            value={settlementInput}
            onChange={onSettlementChange}
            placeholder="450,000"
          />
          <p className="mt-1.5 text-xs text-brand-muted">
            If the case settles, enter the settlement amount. It will be
            marked on the chart and included in the PDF export.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
