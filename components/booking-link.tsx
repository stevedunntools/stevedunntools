"use client";

import { track } from "@vercel/analytics";
import { BOOKING_URL } from "@/lib/booking";

/**
 * Outbound link to Steve's Miles scheduling page. Every placement passes a
 * `placement` so Vercel Analytics can show which one earns the clicks.
 */
export default function BookingLink({
  placement,
  className,
  children,
  onClick,
}: {
  placement: "header" | "menu" | "tool-panel" | "footer";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <a
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        track("booking_click", { placement });
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
