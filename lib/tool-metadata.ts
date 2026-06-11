import type { Metadata } from "next";

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
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Steve Dunn Tools — Settlement tools built by a mediator",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/og-image.png"],
    },
  };
}
