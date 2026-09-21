import { CATEGORIES, TOOLS, toolHref } from "@/lib/tools";

/** Menu / footer groups, derived from the tool registry so they cannot drift. */
export const navGroups = [
  ...CATEGORIES.map((c) => ({
    label: c.label as string,
    links: TOOLS.filter((t) => t.category === c.label).map((t) => ({ href: toolHref(t.slug), label: t.label })),
  })),
  { label: "About", links: [{ href: "/about", label: "About Steve Dunn" }] },
];

export const allToolLinks = navGroups
  .filter((g) => g.label !== "About")
  .flatMap((g) => g.links);

/** Category label for a tool route. */
export function toolCategory(href: string): string {
  return navGroups.find((g) => g.links.some((l) => l.href === href))?.label ?? "Tools";
}

/** One-line description per tool route, for cards and related-tools links. */
export const toolDescriptions: Record<string, string> = Object.fromEntries(
  TOOLS.map((t) => [toolHref(t.slug), t.cardDescription]),
);
