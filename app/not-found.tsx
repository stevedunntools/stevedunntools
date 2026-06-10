import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { allToolLinks } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Page Not Found",
};

const suggestions = allToolLinks.slice(0, 4);

export default function NotFound() {
  return (
    <div className="bg-brand-bg min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-sm font-medium text-brand-accent mb-2">404</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-primary">
          Page not found
        </h1>
        <p className="mt-4 text-brand-muted">
          That page doesn&apos;t exist — it may have moved or been renamed.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-brand-accent hover:text-brand-accent-hover transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all tools
        </Link>

        <div className="mt-12">
          <h2 className="text-sm font-semibold text-brand-primary uppercase tracking-wider mb-4">
            Popular tools
          </h2>
          <ul className="space-y-2">
            {suggestions.map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className="text-sm text-brand-muted hover:text-brand-accent transition-colors"
                >
                  {tool.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
