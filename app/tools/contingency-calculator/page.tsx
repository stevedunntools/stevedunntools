import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contingency Calculator | Steve Dunn Tools",
  description: "Calculate attorney fees under various contingency arrangements and their impact on net recovery.",
};

export default function ContingencyCalculatorPage() {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-accent mb-1">Calculators</p>
        <h1 className="text-3xl font-bold text-brand-primary">Contingency Calculator</h1>
        <p className="mt-2 text-brand-muted">Calculate attorney fees under various contingency arrangements and their impact on net recovery.</p>
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
