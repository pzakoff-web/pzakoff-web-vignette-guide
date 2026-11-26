import type { MetadataRoute } from "next";
import { COUNTRIES } from "@/data/countries";
import { SITE } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`, changeFrequency: "weekly", priority: 1 },
    ...COUNTRIES.map(c => ({ url: `${SITE.url}/${c.slug}/`, lastModified: c.checkedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
