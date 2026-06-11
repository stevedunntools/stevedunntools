"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navGroups, toolDescriptions } from "@/lib/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

/**
 * Links to the other tools in the current tool's category. Rendered by the
 * tools layout, so every tool page gets it automatically.
 */
export default function RelatedTools() {
  const pathname = usePathname();
  const group = navGroups.find((g) => g.links.some((l) => l.href === pathname));
  if (!group) return null;

  const related = group.links.filter((l) => l.href !== pathname);
  if (related.length === 0) return null;

  return (
    <section className="mt-12 print:hidden" aria-label="Related tools">
      <h2 className="text-base font-semibold text-brand-primary mb-4">
        More {group.label.toLowerCase()}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-lg focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:outline-none"
          >
            <Card className="h-full bg-white border-brand-border hover:border-brand-accent hover:shadow-md transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-brand-primary text-base group-hover:text-brand-accent transition-colors">
                  {tool.label}
                </CardTitle>
                {toolDescriptions[tool.href] && (
                  <CardDescription className="text-brand-muted">
                    {toolDescriptions[tool.href]}
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
