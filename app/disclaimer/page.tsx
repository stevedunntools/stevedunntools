import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | Steve Dunn Tools",
  description:
    "Legal disclaimer for Steve Dunn Tools mediation calculators and utilities.",
};

export default function DisclaimerPage() {
  return (
    <div className="bg-brand-bg min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-brand-primary">Disclaimer</h1>
        <p className="mt-4 text-brand-muted">
          This page is under construction. Check back soon.
        </p>
      </div>
    </div>
  );
}
