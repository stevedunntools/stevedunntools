import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Payment Over Time Calculator | Steve Dunn Tools",
  description: "Build a complete payment schedule for settlements paid in installments with interest.",
};

export default function PaymentOverTimePage() {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-accent mb-1">Calculators</p>
        <h1 className="text-3xl font-bold text-brand-primary">Payment Over Time Calculator</h1>
        <p className="mt-2 text-brand-muted">Build a complete payment schedule for settlements paid in installments with interest.</p>
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
