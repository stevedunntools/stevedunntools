import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Steve Dunn | Steve Dunn Tools",
  description:
    "Learn about Steve Dunn and the mediation tools built to help lawyers, mediators, and parties in dispute resolution.",
};

export default function AboutPage() {
  return (
    <div className="bg-brand-bg min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-brand-primary">About Steve Dunn</h1>
        <p className="mt-4 text-brand-muted">
          This page is under construction. Check back soon for more information.
        </p>
      </div>
    </div>
  );
}
