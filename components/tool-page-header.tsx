import SteveNote from "@/components/steve-note";
import { toolCategory } from "@/lib/navigation";

interface ToolPageHeaderProps {
  /** Tool route, e.g. "/tools/bracket-generator" — used to look up the category label. */
  href: string;
  title: string;
  description: string;
  note?: string;
}

const BASE_URL = "https://stevedunntools.com";

export default function ToolPageHeader({
  href,
  title,
  description,
  note,
}: ToolPageHeaderProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: title,
        description,
        url: `${BASE_URL}${href}`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: {
          "@type": "Person",
          name: "Steve Dunn",
          url: `${BASE_URL}/about`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "All Tools", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: title },
        ],
      },
    ],
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 print:hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        <p className="text-sm font-medium text-brand-accent mb-1">
          {toolCategory(href)}
        </p>
        <h1 className="text-3xl font-bold text-brand-primary">{title}</h1>
        <p className="mt-2 text-brand-muted max-w-2xl">{description}</p>
      </div>
      {note && <SteveNote note={note} />}
    </div>
  );
}
