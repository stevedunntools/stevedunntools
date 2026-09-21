import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { fmt } from "@/lib/format";
import { Offer } from "./logic";

interface OfferHistoryProps {
  offers: Offer[];
  onRemove: (id: string) => void;
}

export default function OfferHistory({ offers, onRemove }: OfferHistoryProps) {
  return (
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
                        : `${fmt(m.low)} – ${fmt(m.high)} (${fmt((m.low + m.high) / 2)})`}
                    </td>
                    <td className="py-2 print:hidden">
                      <button
                        onClick={() => onRemove(m.id)}
                        className="p-3 sm:p-1.5 -m-1 text-brand-muted hover:text-brand-error transition-colors print:hidden"
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
  );
}
