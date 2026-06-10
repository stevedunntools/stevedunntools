"use client";

import { useEffect, useState } from "react";

interface MobileResultBarProps {
  label: string;
  value: string;
  /** id of the full results card; the bar hides when it scrolls into view. */
  targetId: string;
}

/**
 * Sticky bottom bar shown on small screens, where the results column stacks
 * below the inputs and would otherwise be off-screen while typing. Shows the
 * headline result live; tapping it scrolls to the full results card, and it
 * slides away once that card is visible.
 */
export default function MobileResultBar({ label, value, targetId }: MobileResultBarProps) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) =>
      setHidden(entry.isIntersecting)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [targetId]);

  return (
    <button
      type="button"
      onClick={() =>
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      aria-label={`${label}: ${value}. Scroll to full results.`}
      className={`fixed bottom-0 inset-x-0 z-40 lg:hidden print:hidden flex items-center justify-between gap-3 px-4 py-3 bg-brand-primary text-white shadow-[0_-2px_10px_rgba(0,0,0,0.2)] transition-transform duration-200 ${
        hidden ? "translate-y-full" : ""
      }`}
    >
      <span className="text-sm text-gray-300">{label}</span>
      <span className="text-lg font-bold tabular-nums">{value}</span>
    </button>
  );
}
