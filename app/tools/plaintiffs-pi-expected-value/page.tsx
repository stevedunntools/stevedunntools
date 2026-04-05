import type { Metadata } from "next";
import PlaintiffsPIExpectedValueClient from "./client";

export const metadata: Metadata = {
  title: "Plaintiff's PI Expected Value | Steve Dunn Tools",
  description:
    "Calculate the probability-weighted, time-discounted expected value of a personal injury case.",
};

export default function PlaintiffsPIExpectedValuePage() {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-accent mb-1">
          Settlement Analysis
        </p>
        <h1 className="text-3xl font-bold text-brand-primary">
          Plaintiff&apos;s PI Expected Value
        </h1>
        <p className="mt-2 text-brand-muted max-w-2xl">
          Calculate the expected value of a personal injury case, adjusted for
          the probability of success and the time value of money. If you have
          already filled out the Personal Injury Damages Estimator, the damages
          amount will be pre-filled.
        </p>
      </div>
      <PlaintiffsPIExpectedValueClient />
    </>
  );
}
