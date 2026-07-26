import { toolMetadata } from "@/lib/tool-metadata";
import { allToolLinks } from "@/lib/navigation";
import ToolCardGrid from "@/components/tool-card-grid";

const description =
  "Browse every free settlement tool: negotiation charts, damages estimators, contingency fee calculators, payment schedules, interest, and date tools.";

export const metadata = toolMetadata({
  title: "All Tools",
  seoTitle: "All Settlement Tools & Calculators",
  description,
  path: "/tools",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "All Settlement Tools & Calculators",
  url: "https://stevedunntools.com/tools",
  description,
  mainEntity: {
    "@type": "ItemList",
    itemListElement: allToolLinks.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: tool.label,
      url: `https://stevedunntools.com${tool.href}`,
    })),
  },
};

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-brand-primary">
          All Settlement Tools
        </h1>
        <p className="mt-2 text-brand-muted max-w-2xl">
          Every calculator and utility on the site, grouped by what you are
          trying to do. Free, fast, and private — nothing leaves your browser.
        </p>
      </div>
      <ToolCardGrid />
    </>
  );
}
