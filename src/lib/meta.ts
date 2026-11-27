import type { Metadata, Viewport } from "next";
import { SITE } from "./site";
import { T, type Lang } from "./i18n";

export const viewport: Viewport = { themeColor: "#fbfbf9", width: "device-width", initialScale: 1 };

export function baseMetadata(lang: Lang): Metadata {
  const t = T[lang];
  return {
    metadataBase: new URL(SITE.url),
    title: { default: `${t.metaTitle} | ${SITE.name}`, template: `%s | ${SITE.name}` },
    description: t.metaDesc,
    openGraph: { type: "website", locale: lang === "bg" ? "bg_BG" : "en_GB", siteName: SITE.name },
  };
}

/** canonical + hreflang за двойка страници. */
export const alternates = (bgPath: string, enPath: string, lang: Lang): Metadata["alternates"] => ({
  canonical: lang === "bg" ? bgPath : enPath,
  languages: { bg: bgPath, en: enPath, "x-default": enPath },
});
