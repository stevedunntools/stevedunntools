import type { MetadataRoute } from "next";
import { allToolLinks } from "@/lib/navigation";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://stevedunntools.com";

  const staticPages = [
    { url: baseUrl, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/disclaimer`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const toolPages = allToolLinks.map((tool) => ({
    url: `${baseUrl}${tool.href}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...toolPages];
}
