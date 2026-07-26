import { OG_CONTENT_TYPE, OG_SIZE, renderToolOgImage } from "@/lib/tool-og-image";

export const alt = "W-2, 1099, and Attorney Fee Calculator — Steve Dunn Tools";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderToolOgImage(
    "W-2, 1099, and Attorney Fee Calculator",
    "Net recovery with wage vs. non-wage allocation."
  );
}
