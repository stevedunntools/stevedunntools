import { OG_CONTENT_TYPE, OG_SIZE, renderToolOgImage } from "@/lib/tool-og-image";
import { toolBySlug } from "@/lib/tools";

const tool = toolBySlug("personal-injury-damages-estimator");

export const alt = `${tool.ogTitle ?? tool.label} — Steve Dunn Tools`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderToolOgImage(tool.ogTitle ?? tool.label, tool.tagline);
}
