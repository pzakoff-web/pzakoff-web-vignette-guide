import type { Metadata } from "next";
import type { Country } from "@/data/types";
import { localize } from "@/data/localize";
import { EN } from "@/data/countries.en";
import { T, fmtDate, type Lang } from "./i18n";
import { alternates } from "./meta";

export function countryMetadata(c: Country, lang: Lang): Metadata {
  const t = T[lang], l = localize(c, lang);
  const what = c.products?.length ? t.vignette : t.tolls;
  return {
    title: t.countryMetaTitle(what, l.name),
    description: t.countryMetaDesc(what, l.name, fmtDate(c.checkedAt, lang)),
    alternates: alternates(`/${c.slug}/`, `/en/${EN[c.code].slug}/`, lang),
  };
}
