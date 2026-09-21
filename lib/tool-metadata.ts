import type { Metadata } from "next";
import { toolBySlug, toolHref } from "@/lib/tools";

interface ToolMetadataOpts {
  /** Tool name as shown on the page. */
  title: string;
  /** Optional search-facing title (keyword-rich); defaults to `title`. */
  seoTitle?: string;
  description: string;
  /** Route path, e.g. "/tools/bracket-generator". */
  path: string;
}

/**
 * Standard metadata for a tool page: title, description, canonical, and
 * per-tool Open Graph / Twitter tags so shared links name the tool instead
 * of the generic site card.
 *
 * og:image / twitter:image are intentionally NOT set here — each tool
 * directory has an `opengraph-image.tsx` (file-based metadata), which the
 * Next.js docs give higher priority than exported metadata. That file also
 * supplies the per-tool `og:image:alt` via its `alt` export. Pages without
 * an `opengraph-image` fall back to the site-wide /og-image.png set in the
 * root layout, and X falls back to og:image when twitter:image is absent.
 */
export function toolMetadata({ title, seoTitle, description, path }: ToolMetadataOpts): Metadata {
  const fullTitle = `${seoTitle ?? title} | Steve Dunn Tools`;
  return {
    title: seoTitle ?? title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: "Steve Dunn Tools",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

/** Metadata for a registered tool page. */
export function toolPageMetadata(slug: string): Metadata {
  const t = toolBySlug(slug);
  return toolMetadata({ title: t.label, seoTitle: t.seoTitle, description: t.metaDescription, path: toolHref(slug) });
}
