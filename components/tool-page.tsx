import ToolPageHeader from "@/components/tool-page-header";
import ToolPageFooter from "@/components/tool-page-footer";
import { toolBySlug, toolHref } from "@/lib/tools";

/** Standard tool page: header from the registry, the tool, then booking / explanation / related. */
export default function ToolPage({ slug, children }: { slug: string; children: React.ReactNode }) {
  const t = toolBySlug(slug);
  const href = toolHref(slug);
  return (
    <>
      <ToolPageHeader href={href} title={t.label} description={t.pageDescription} />
      {children}
      <ToolPageFooter href={href} />
    </>
  );
}
