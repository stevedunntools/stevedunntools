import { OG_CONTENT_TYPE, OG_SIZE, renderToolOgImage } from "@/lib/tool-og-image";

export const alt = "Settlement Take-Home After Taxes — Steve Dunn Tools";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderToolOgImage(
    "Settlement Take-Home After Taxes",
    "A rough guess at take-home pay after federal and state taxes."
  );
}
