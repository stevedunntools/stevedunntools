import type { MetadataRoute } from "next";
import { allToolLinks } from "@/lib/navigation";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://stevedunntools.com";

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/disclaimer`, lastModified: new Date(), priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), priority: 0.3 },
  ];

  const toolPages = allToolLinks.map((tool) => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: new Date(),
    priority: 0.9,
  }));

  return [...staticPages, ...toolPages];
}
