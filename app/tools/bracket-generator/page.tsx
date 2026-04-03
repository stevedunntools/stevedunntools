import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Bracket Generator | Steve Dunn Tools",
  description: "Generate bracketed offer ranges to propose structured negotiation moves.",
};

export default function BracketGeneratorPage() {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-accent mb-1">Negotiation Tools</p>
        <h1 className="text-3xl font-bold text-brand-primary">Bracket Generator</h1>
        <p className="mt-2 text-brand-muted">Generate bracketed offer ranges to propose structured negotiation moves.</p>
      </div>
      <Card className="bg-white border-brand-border">
        <CardHeader>
          <CardTitle className="text-brand-primary">Coming Soon</CardTitle>
          <CardDescription className="text-brand-muted">
            This tool is under development. Check back soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 rounded-lg bg-brand-card flex items-center justify-center">
            <p className="text-brand-muted text-sm">Tool interface will appear here</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
