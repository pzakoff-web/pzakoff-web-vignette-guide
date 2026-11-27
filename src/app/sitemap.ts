import type { MetadataRoute } from "next";
import { COUNTRIES } from "@/data/countries";
import { EN } from "@/data/countries.en";
import { SITE } from "@/lib/site";
export const dynamic = "force-static";

const pair = (bg: string, en: string, extra: Partial<MetadataRoute.Sitemap[number]> = {}): MetadataRoute.Sitemap => {
  const languages = { bg: `${SITE.url}${bg}`, en: `${SITE.url}${en}` };
  return [
    { url: `${SITE.url}${bg}`, alternates: { languages }, ...extra },
    { url: `${SITE.url}${en}`, alternates: { languages }, ...extra },
  ];
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pair("/", "/en/", { changeFrequency: "weekly", priority: 1 }),
    ...COUNTRIES.flatMap(c => pair(`/${c.slug}/`, `/en/${EN[c.code].slug}/`, { lastModified: c.checkedAt, changeFrequency: "monthly", priority: 0.8 })),
  ];
}
