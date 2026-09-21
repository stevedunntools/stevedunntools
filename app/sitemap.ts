import type { MetadataRoute } from "next";
import { allToolLinks } from "@/lib/navigation";

const baseUrl = "https://stevedunntools.com";

/** Every indexable page. No lastModified: a build timestamp would claim every
 *  page changed on every deploy, which search engines learn to ignore. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/tools", "/about", "/disclaimer", "/privacy"];
  return [...staticPages, ...allToolLinks.map((t) => t.href)].map((path) => ({ url: `${baseUrl}${path}` }));
}
