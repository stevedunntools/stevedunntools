import { OG_CONTENT_TYPE, OG_SIZE, renderToolOgImage } from "@/lib/tool-og-image";

export const alt = "Plaintiff's Expected Value — Steve Dunn Tools";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderToolOgImage(
    "Plaintiff's Expected Value",
    "Probability-weighted case value, adjusted for costs."
  );
}
