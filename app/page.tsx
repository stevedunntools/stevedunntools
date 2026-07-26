import type { Metadata } from "next";
import ToolCardGrid from "@/components/tool-card-grid";
import { allToolLinks } from "@/lib/navigation";

export const metadata: Metadata = {
  description:
    "Practical settlement tools built by a mediator. Free calculators and utilities for lawyers, mediators, and parties in dispute resolution.",
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Steve Dunn Tools",
  url: "https://stevedunntools.com",
  description:
    "Practical settlement tools built by a mediator. Free calculators and utilities for lawyers, mediators, and parties in dispute resolution.",
  author: {
    "@type": "Person",
    name: "Steve Dunn",
    jobTitle: "Mediator",
    url: "https://stevedunntools.com/about",
  },
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Settlement Tools",
  itemListElement: allToolLinks.map((tool, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: tool.label,
    url: `https://stevedunntools.com${tool.href}`,
  })),
};

export default function Home() {
  return (
    <div className="bg-brand-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {/* Hero */}
      <section className="py-12 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-primary">
            Settlement tools built by a mediator.
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-brand-muted">
            Practical calculators and utilities for lawyers, mediators, and
            parties in dispute resolution. Free, fast, and private — nothing
            leaves your browser.
          </p>
        </div>
      </section>

      {/* Tool Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ToolCardGrid />
        </div>
      </section>
    </div>
  );
}
