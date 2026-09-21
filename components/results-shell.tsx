import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import EstimateDisclaimer from "@/components/estimate-disclaimer";
import ExportPdfButton from "@/components/export-pdf-button";

interface ResultsShellProps {
  /** Small label above the headline value (e.g. "Net to Plaintiff"). */
  label: string;
  /** The big headline value, pre-formatted (e.g. "$125,000" or "—"). */
  value: string;
  /** Extra content rendered inside the headline card, after the value. */
  headlineExtra?: ReactNode;
  /** Additional result cards (breakdown etc.) below the headline. */
  children?: ReactNode;
}

/**
 * Shared results-column scaffold: sticky container with a headline result
 * card (id="tool-headline-result" — MobileResultBar scrolls to it), optional
 * detail cards, the estimate disclaimer, and the PDF export button.
 */
export default function ResultsShell({
  label,
  value,
  headlineExtra,
  children,
}: ResultsShellProps) {
  return (
    <div className="sticky top-20 space-y-6">
      <Card id="tool-headline-result" className="bg-white border-brand-accent">
        <CardContent className="pt-6">
          <p className="text-sm text-brand-muted mb-1">{label}</p>
          <p className="text-3xl font-bold text-brand-accent" aria-live="polite" aria-atomic="true">{value}</p>
          {headlineExtra}
        </CardContent>
      </Card>

      {children}

      <EstimateDisclaimer />
      <div className="print:hidden">
        <ExportPdfButton />
      </div>
    </div>
  );
}
