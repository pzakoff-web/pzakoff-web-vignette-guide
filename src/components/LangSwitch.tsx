"use client";
// Превключва към същата страница на другия език и пази пътуването (?…#…).
import { usePathname } from "next/navigation";
import { COUNTRIES } from "@/data/countries";
import { EN } from "@/data/countries.en";
import type { Lang } from "@/lib/i18n";

function counterpart(path: string, lang: Lang): string {
  const p = path.endsWith("/") ? path : path + "/";
  if (lang === "bg") {
    if (p === "/") return "/en/";
    if (p === "/poveritelnost/") return "/en/privacy/";
    const c = COUNTRIES.find(x => p === `/${x.slug}/`);
    return c ? `/en/${EN[c.code].slug}/` : "/en/";
  }
  if (p === "/en/") return "/";
  if (p === "/en/privacy/") return "/poveritelnost/";
  const c = COUNTRIES.find(x => p === `/en/${EN[x.code].slug}/`);
  return c ? `/${c.slug}/` : "/";
}

export function LangSwitch({ lang, label, title }: { lang: Lang; label: string; title: string }) {
  const path = usePathname() || "/";
  const href = counterpart(path, lang);
  return (
    <a className="lang" href={href} hrefLang={lang === "bg" ? "en" : "bg"} title={title}
      onClick={e => { e.preventDefault(); window.location.href = href + window.location.search + window.location.hash; }}>
      {label}
    </a>
  );
}
