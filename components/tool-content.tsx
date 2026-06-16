"use client";

import { usePathname } from "next/navigation";
import { toolContent } from "@/lib/tool-content";

/**
 * Long-form content rendered below each tool: How it works, a worked example,
 * when to use it, and an FAQ. Adds FAQPage structured data so the questions
 * are eligible for rich results. Looks the content up by route, so the tools
 * layout can render it once for every tool page.
 */
export default function ToolContent() {
  const pathname = usePathname();
  const content = toolContent[pathname];
  if (!content) return null;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section
      className="mt-12 max-w-3xl print:hidden"
      aria-label="About this tool"
    >
      {content.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <Prose heading="How it works" paragraphs={content.howItWorks} />
      <Prose heading="Worked example" paragraphs={content.example} />
      <Prose heading="When to use it" paragraphs={content.whenToUse} />

      {content.faqs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-brand-primary mb-3">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-brand-border border-t border-brand-border">
            {content.faqs.map((faq) => (
              <details key={faq.q} className="group py-3">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-brand-primary font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base font-medium">{faq.q}</h3>
                  <span className="text-brand-muted transition-transform group-open:rotate-180">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-2 text-brand-muted leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Prose({ heading, paragraphs }: { heading: string; paragraphs: string[] }) {
  if (paragraphs.length === 0) return null;
  return (
    <div className="mt-8 first:mt-0">
      <h2 className="text-xl font-semibold text-brand-primary mb-3">{heading}</h2>
      <div className="space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-brand-primary leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
