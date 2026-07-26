import { OG_CONTENT_TYPE, OG_SIZE, renderToolOgImage } from "@/lib/tool-og-image";

export const alt = "Employment Damages Estimator — Steve Dunn Tools";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderToolOgImage(
    "Employment Damages Estimator",
    "Back pay, front pay, benefits, and more."
  );
}
