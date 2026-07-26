import { OG_CONTENT_TYPE, OG_SIZE, renderToolOgImage } from "@/lib/tool-og-image";

export const alt = "Simple Interest Calculator — Steve Dunn Tools";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderToolOgImage(
    "Simple Interest Calculator",
    "Simple interest on any amount, over any period, at any rate."
  );
}
