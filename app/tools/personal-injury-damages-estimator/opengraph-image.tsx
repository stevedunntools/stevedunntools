import { OG_CONTENT_TYPE, OG_SIZE, renderToolOgImage } from "@/lib/tool-og-image";

export const alt = "Personal Injury Damages Estimator — Steve Dunn Tools";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderToolOgImage(
    "Personal Injury Damages Estimator",
    "Medical costs, lost earnings, and non-economic damages."
  );
}
