import type { Country } from "./types";
import { EN } from "./countries.en";
import type { Lang } from "@/lib/i18n";

const cache = new Map<string, Country>();

/** Копие на държавата с текстовете на дадения език (цените и правилата са общи). */
export function localize(c: Country, lang: Lang): Country {
  if (lang === "bg") return c;
  const key = c.code;
  if (cache.has(key)) return cache.get(key)!;
  const e = EN[c.code];
  const out: Country = {
    ...c,
    name: c.nameEn,
    slug: e.slug,
    scope: e.scope,
    official: c.official.map((l, i) => ({ ...l, label: e.official[i] ?? l.label })),
    products: c.products?.map(p => ({ ...p, label: e.products?.[p.id]?.label ?? p.label, note: e.products?.[p.id]?.note })),
    sectionTolls: c.sectionTolls?.map(t => ({ ...t, name: e.sectionTolls?.[t.id]?.name ?? t.name, note: e.sectionTolls?.[t.id]?.note })),
    tollInfo: e.tollInfo ?? c.tollInfo,
    traps: e.traps,
    facts: e.facts,
    statusNote: e.statusNote ?? c.statusNote,
    pricesValidFor: e.pricesValidFor ?? c.pricesValidFor,
  };
  cache.set(key, out);
  return out;
}
