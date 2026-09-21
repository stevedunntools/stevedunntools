import { CalendarCheck } from "lucide-react";
import BookingLink from "@/components/booking-link";
import { BOOKING_BODY, BOOKING_HEADLINE } from "@/lib/booking";

/** The invitation shown after every tool, above the related-tools cards. */
export default function BookingPanel() {
  return (
    <section
      className="mt-12 print:hidden rounded-xl border border-brand-border bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5"
      aria-label="Book a mediation with Steve Dunn"
    >
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-brand-primary flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-brand-accent-text" aria-hidden="true" />
          {BOOKING_HEADLINE}
        </h2>
        <p className="mt-2 text-brand-muted leading-relaxed">{BOOKING_BODY}</p>
      </div>
      <BookingLink
        placement="tool-panel"
        className="inline-flex items-center justify-center rounded-md bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 whitespace-nowrap"
      >
        Check availability
      </BookingLink>
    </section>
  );
}
