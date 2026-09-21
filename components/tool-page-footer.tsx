import BookingPanel from "@/components/booking-panel";
import RelatedTools from "@/components/related-tools";
import ToolContent from "@/components/tool-content";

/** Everything below the tool itself: booking invitation, explanation, related tools. */
export default function ToolPageFooter({ href }: { href: string }) {
  return (
    <>
      <BookingPanel />
      <ToolContent href={href} />
      <RelatedTools href={href} />
    </>
  );
}
